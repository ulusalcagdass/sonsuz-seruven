#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Güncelleme başlatılıyor..."
git add .
git commit -m "Otomatik güncelleme: $(date)"
git push
echo "✅ İŞLEM TAMAM! Siteniz güncellendi."
echo "Pencereyi kapatabilirsiniz."
