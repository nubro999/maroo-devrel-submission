FROM golang:1.25.13-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends python3 ca-certificates && rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/DELIGHT-LABS/clairveil.git /opt/clairveil && git -C /opt/clairveil checkout --detach af04cfc994a3da87a8b1b902eda0988feb512539
COPY run-local.py prepare-terminal.py configgen.go /opt/lab/
COPY container/start.sh /opt/lab/start.sh
COPY container/cpucheck.go /opt/lab/cpucheck.go
RUN cd /opt/clairveil && go build -o /opt/lab/check-cpu /opt/lab/cpucheck.go
ENV GOPATH=/cache/go GOCACHE=/cache/build GOMAXPROCS=4
WORKDIR /opt/clairveil
ENTRYPOINT ["bash", "/opt/lab/start.sh"]
