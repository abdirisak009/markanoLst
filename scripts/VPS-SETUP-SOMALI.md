# VPS-ka gal – hal mar oo kaliya

Aniga (AI) ma geli karo VPS-kaaga. Waa inaad **adiga** laptop-kaaga ka SSH gashaa VPS-ka, kadibna orodaa command-yada hoose.

---

## Tallaabo 1: GitHub token

1. Tag: https://github.com/abdirisak009/markanoLst/settings/actions/runners/new  
2. Hoos ka **copy** qaybta "Configure" ee token-ka (qiyaastii 30 xaraf).

---

## Tallaabo 2: VPS-ka SSH geli

Laptop-kaaga terminal (ama Cursor terminal) fur, kadibna:

```bash
ssh root@IP_VPS_KAAGA
```

(Beddel `IP_VPS_KAAGA` IP-ka VPS-kaaga. Haddii aad isticmaasho password, geli password-ka.)

---

## Tallaabo 3: VPS-ka gudaheed orod

Kadib markaad VPS-ka ku jirto, orod **labadan** (token-ka beddel):

```bash
cd /root/markanoLst && git pull
```

Kadibna (HALKAN_TOKEN copy-garay ka beddel):

```bash
sudo GITHUB_RUNNER_TOKEN="HALKAN_TOKEN" bash scripts/setup-github-runner-on-vps.sh
```

Haddii `/root/markanoLst` aan lahan, marka hore clone:

```bash
cd /root && git clone https://github.com/abdirisak009/markanoLst.git && cd markanoLst
sudo GITHUB_RUNNER_TOKEN="HALKAN_TOKEN" bash scripts/setup-github-runner-on-vps.sh
```

---

## Kadib

- Push to **main** = deploy VPS-ka (ma baahnid firewall/SSH).
- Haddii "Deploy to VPS" (SSH) weli jiro oo ku fail garo, repo → Settings → Actions: workflow-ka "Deploy to VPS" disable-garee ama file-ka `deploy.yml` ka saar.
