package main
import("fmt";"os";"runtime";"golang.org/x/sys/cpu")
func main(){ok:=false;switch runtime.GOARCH{case "amd64":ok=cpu.X86.HasAES&&cpu.X86.HasPCLMULQDQ;case "arm64":ok=cpu.ARM64.HasAES&&cpu.ARM64.HasPMULL&&cpu.ARM64.HasDIT};if !ok{fmt.Fprintln(os.Stderr,"Privacy CPU check failed: amd64 requires AES/PCLMULQDQ; arm64 requires AES/PMULL/DIT. Check Docker virtualization CPU support before running this lab.");os.Exit(1)};fmt.Println("Privacy CPU check passed:",runtime.GOARCH)}
