"""10주차 AI보안 실습 — 사전학습 이미지 분류 + FGSM 적대적 예제.

설치:
    pip install torch torchvision pillow

실행:
    python classifier.py samples/panda.jpg          # 정상 분류
    python classifier.py samples/panda.jpg --eps 0.03  # FGSM 공격

Colab 대안: 이 파일을 그대로 셀에 붙여 넣어도 동작한다.
"""
import argparse
import torch
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image

# 사전학습 모델 (ImageNet)
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


def predict(x):
    with torch.no_grad():
        out = model(normalize(x).unsqueeze(0))
    prob = F.softmax(out, dim=1)
    conf, idx = prob.max(1)
    return categories[idx.item()], conf.item()


def fgsm(x, epsilon):
    """x 에 FGSM 노이즈를 더해 오분류를 유도한다."""
    x = x.clone().detach().requires_grad_(True)
    out = model(normalize(x).unsqueeze(0))
    label = out.argmax(1)
    loss = F.cross_entropy(out, label)
    model.zero_grad()
    loss.backward()
    x_adv = x + epsilon * x.grad.sign()      # x_adv = x + ε·sign(∇xJ)
    return x_adv.clamp(0, 1).detach()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("image")
    ap.add_argument("--eps", type=float, default=0.0, help="FGSM epsilon (0 이면 공격 없음)")
    args = ap.parse_args()

    x = preprocess(Image.open(args.image).convert("RGB"))
    label, conf = predict(x)
    print(f"[원본]  {label}  ({conf:.1%})")

    if args.eps > 0:
        x_adv = fgsm(x, args.eps)
        label2, conf2 = predict(x_adv)
        print(f"[공격]  {label2}  ({conf2:.1%})  eps={args.eps}")
        print("오분류 발생!" if label2 != label else "아직 오분류 안 됨 — eps 를 키워보라")


if __name__ == "__main__":
    main()
