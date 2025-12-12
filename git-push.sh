#!/bin/bash
# Git Push Script for celenkdiyari
# Bu script'i Git Bash'te çalıştırın

echo "=== Git Repository Başlatılıyor ==="

# Git repository başlat
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: Çelenk Diyarı projesi"

# GitHub remote ekle
echo ""
echo "=== GitHub Remote Eklenecek ==="
echo "GitHub'da yeni bir repository oluşturun veya mevcut repo'yu silip yeniden oluşturun"
echo ""
echo "Sonra şu komutları çalıştırın:"
echo "git remote add origin https://github.com/yasinnabialtun/celenkdiyari.git"
echo "git branch -M main"
echo "git push -u origin main"

echo ""
echo "=== Manuel Adımlar ==="
echo "1. GitHub'da https://github.com/yasinnabialtun/celenkdiyari adresine gidin"
echo "2. Settings > Danger Zone > Delete this repository"
echo "3. Yeni bir repository oluşturun (aynı isimle: celenkdiyari)"
echo "4. Yukarıdaki git remote ve push komutlarını çalıştırın"

