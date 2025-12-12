# Git Push Script for celenkdiyari
# Bu script'i Git Bash veya PowerShell'de çalıştırın

Write-Host "=== Git Repository Başlatılıyor ===" -ForegroundColor Green

# Git repository başlat
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: Çelenk Diyarı projesi"

# GitHub remote ekle (mevcut repo'yu silip yeniden oluşturduktan sonra)
Write-Host "`n=== GitHub Remote Eklenecek ===" -ForegroundColor Yellow
Write-Host "GitHub'da yeni bir repository oluşturun veya mevcut repo'yu silip yeniden oluşturun" -ForegroundColor Yellow
Write-Host "Sonra şu komutu çalıştırın:" -ForegroundColor Yellow
Write-Host "git remote add origin https://github.com/yasinnabialtun/celenkdiyari.git" -ForegroundColor Cyan
Write-Host "git branch -M main" -ForegroundColor Cyan
Write-Host "git push -u origin main" -ForegroundColor Cyan

Write-Host "`n=== Manuel Adımlar ===" -ForegroundColor Yellow
Write-Host "1. GitHub'da https://github.com/yasinnabialtun/celenkdiyari adresine gidin" -ForegroundColor White
Write-Host "2. Settings > Danger Zone > Delete this repository" -ForegroundColor White
Write-Host "3. Yeni bir repository oluşturun (aynı isimle: celenkdiyari)" -ForegroundColor White
Write-Host "4. Yukarıdaki git remote ve push komutlarını çalıştırın" -ForegroundColor White

