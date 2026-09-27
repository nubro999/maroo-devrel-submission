// Local development only. Run from the pinned Clairveil module.
// Creates public chain config and a separate 0600 auditor key; never publish that key.
package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	pc "github.com/DELIGHT-LABS/clairveil/x/privacy/crypto"
	af "github.com/DELIGHT-LABS/clairveil/x/privacy/crypto/auditfield"
	pt "github.com/DELIGHT-LABS/clairveil/x/privacy/types"
	zk "github.com/DELIGHT-LABS/clairveil/x/privacy/zk"
	"os"
	"path/filepath"
)

func must(err error) {
	if err != nil {
		panic(err)
	}
}
func write(path string, value any) {
	b, e := json.MarshalIndent(value, "", "  ")
	must(e)
	f, e := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0600)
	must(e)
	_, e = f.Write(append(b, '\n'))
	must(e)
	must(f.Close())
}
func main() {
	if len(os.Args) != 3 {
		panic("usage: configgen ARTIFACT_DIR NEW_OUTPUT_DIR")
	}
	out := os.Args[2]
	must(os.Mkdir(out, 0700))
	reg, e := zk.NewArtifactRegistry(zk.ArtifactRegistryConfig{ArtifactDir: os.Args[1], CircuitSetID: zk.AuditFieldCircuitSetID, RuntimeEnvironment: zk.ZKRuntimeEnvironmentDevelopment})
	must(e)
	identity, e := reg.LocalCircuitSetIdentity()
	must(e)
	var nonce [32]byte
	_, e = rand.Read(nonce[:])
	must(e)
	chain := "devrel-local-1"
	network, e := af.NetworkDigest(chain, nonce)
	must(e)
	secret, e := pc.SampleAuditSecretKey(rand.Reader)
	must(e)
	key, e := pc.AuditKeyFromSecret(secret)
	must(e)
	pop, e := pc.CreateAuditPoP96(secret, network, 1, 0)
	must(e)
	proof, e := pop.Bytes()
	must(e)
	must(pc.VerifyAuditPoP96(key, network, 1, 0, pop))
	config := struct {
		ChainID  string                 `json:"chain_id"`
		Nonce    []byte                 `json:"network_nonce32"`
		Height   uint64                 `json:"initial_height"`
		Key      pt.InitialAuditKeyV4   `json:"initial_audit_key"`
		Identity *pt.CircuitSetIdentity `json:"circuit_set_identity"`
	}{chain, nonce[:], 1, pt.InitialAuditKeyV4{Epoch: 1, KeyID: key.IDBytes(), Suite: 2, PublicKey: key.Point().Bytes(), PoP: proof}, identity}
	raw := secret.Bytes()
	write(filepath.Join(out, "auditor-private.json"), map[string]any{"version": 1, "keys": []map[string]string{{"key_id": hex.EncodeToString(key.IDBytes()), "secret_key": hex.EncodeToString(raw[:])}}})
	write(filepath.Join(out, "audit-config.json"), config)
	fmt.Println("Development config generated; PoP verified; private auditor key retained locally with mode 0600.")
}
