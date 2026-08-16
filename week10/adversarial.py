"""week10/adversarial.py — 과제 2: FGSM 적대적 공격 & 방어 비교

starter/ai/classifier.py 를 확장한다.
  - 여러 이미지에 epsilon 을 스윕하며 오분류율(misclassification rate)을 측정
  - 방어 기법(가우시안 블러 / JPEG 재압축) 적용 전후 오분류율 비교
  - epsilon–오분류율 그래프를 PNG 로 저장

설치:
    pip install torch torchvision pillow matplotlib

실행:
    # 이미지 폴더(기본 samples/)에 여러 장을 두고 실행
    python adversarial.py --images samples --out week10
    # → week10/eps-misclass.png, 화면에 요약 표

Colab 대안: 셀에 그대로 붙여넣고 argparse 대신 변수로 경로를 지정해도 된다.
"""
import argparse
import glob
import io
import os

import torch
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image, ImageFilter
import matplotlib

matplotlib.use("Agg")  # 헤드리스 환경에서 파일로만 저장
import matplotlib.pyplot as plt

# --- 사전학습 모델 (ImageNet) ---
weights = models.MobileNet_V2_Weights.DEFAULT
model = models.mobilenet_v2(weights=weights).eval()
categories = weights.meta["categories"]

preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
])
normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225])


def predict_idx(x):
    """정규화 후 예측 클래스 인덱스와 확신도를 반환."""
    with torch.no_grad():
        out = model(normalize(x).unsqueeze(0))
    prob = F.softmax(out, dim=1)
    conf, idx = prob.max(1)
    return idx.item(), conf.item()


def fgsm(x, epsilon):
    """x_adv = x + ε·sign(∇xJ) — 원 라벨 기준 손실을 키우는 방향으로 노이즈."""
    x = x.clone().detach().requires_grad_(True)
    out = model(normalize(x).unsqueeze(0))
    label = out.argmax(1)
    loss = F.cross_entropy(out, label)
    model.zero_grad()
    loss.backward()
    x_adv = x + epsilon * x.grad.sign()
    return x_adv.clamp(0, 1).detach()


# --- 방어 기법: 입력 전처리로 적대적 노이즈를 무디게 만든다 ---
def defend_blur(x):
    """가우시안 블러 — 고주파 적대적 노이즈를 완화."""
    img = transforms.ToPILImage()(x)
    img = img.filter(ImageFilter.GaussianBlur(radius=1.0))
    return transforms.ToTensor()(img)


def defend_jpeg(x, quality=40):
    """JPEG 재압축 — 손실 압축으로 미세 노이즈를 제거."""
    img = transforms.ToPILImage()(x)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality)
    buf.seek(0)
    return transforms.ToTensor()(Image.open(buf).convert("RGB"))


def load_images(folder):
    paths = []
    for ext in ("*.jpg", "*.jpeg", "*.png"):
        paths.extend(glob.glob(os.path.join(folder, ext)))
    if not paths:
        raise SystemExit(f"[!] {folder} 에 이미지가 없습니다. get-samples.sh 로 받거나 직접 넣으세요.")
    return sorted(paths)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--images", default="samples", help="이미지 폴더")
    ap.add_argument("--out", default=".", help="그래프 저장 폴더")
    ap.add_argument("--defense", choices=["blur", "jpeg"], default="blur")
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    paths = load_images(args.images)
    epsilons = [0.0, 0.01, 0.02, 0.03, 0.05, 0.08, 0.1]
    defense = defend_blur if args.defense == "blur" else defend_jpeg

    # 원본 이미지별 '정답(공격 전 예측)' 을 기준으로 오분류 여부 판정
    originals = []
    for p in paths:
        x = preprocess(Image.open(p).convert("RGB"))
        base_idx, _ = predict_idx(x)
        originals.append((p, x, base_idx))

    attack_rate, defend_rate = [], []
    print(f"이미지 {len(paths)}장, epsilon 스윕: {epsilons}\n")
    for eps in epsilons:
        atk_miss = def_miss = 0
        for p, x, base_idx in originals:
            x_adv = fgsm(x, eps) if eps > 0 else x
            adv_idx, _ = predict_idx(x_adv)
            if adv_idx != base_idx:
                atk_miss += 1
            # 방어: 적대적 이미지를 전처리한 뒤 다시 분류
            d_idx, _ = predict_idx(defend(x_adv))
            if d_idx != base_idx:
                def_miss += 1
        a = atk_miss / len(originals)
        d = def_miss / len(originals)
        attack_rate.append(a)
        defend_rate.append(d)
        print(f"  eps={eps:<5}  공격 오분류율={a:5.0%}   방어 후={d:5.0%}")

    # --- 그래프 저장 ---
    plt.figure(figsize=(7, 4))
    plt.plot(epsilons, attack_rate, "o-", label="공격(FGSM)")
    plt.plot(epsilons, defend_rate, "s--", label=f"방어({args.defense})")
    plt.xlabel("epsilon")
    plt.ylabel("오분류율 (misclassification rate)")
    plt.title("FGSM epsilon vs 오분류율 (방어 전/후)")
    plt.ylim(-0.05, 1.05)
    plt.grid(True, alpha=0.3)
    plt.legend()
    out_png = os.path.join(args.out, "eps-misclass.png")
    plt.savefig(out_png, dpi=120, bbox_inches="tight")
    print(f"\n그래프 저장: {out_png}")
    print("해석: epsilon 이 커질수록 공격 오분류율↑. 방어(전처리)는 낮은 epsilon 에서")
    print("      효과적이나, epsilon 이 크면 방어도 뚫린다(방어의 한계).")


if __name__ == "__main__":
    main()
