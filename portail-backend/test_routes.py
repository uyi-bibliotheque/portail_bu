# test_routes.py - Script pour tester les routes Django

import os
import sys
import django
import requests
import json

# Configuration
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.urls import get_resolver
from django.test import Client

def test_urls():
    """Teste toutes les routes des mémoires"""
    print("=" * 70)
    print("🔍 TEST DES ROUTES DES MÉMOIRES")
    print("=" * 70)
    
    client = Client()
    
    # Liste des routes à tester
    routes = [
        ("/api/memoires/test/", "Route de test"),
        ("/api/memoires/archives/public/", "Archives publiques"),
        ("/api/memoires/memoires/", "Liste des mémoires (protégée)"),
        ("/api/memoires/stats/", "Statistiques (protégée)"),
    ]
    
    for url, description in routes:
        print(f"\n📌 {description}: {url}")
        try:
            response = client.get(url)
            print(f"   ✅ Status: {response.status_code}")
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"   📄 Réponse: {json.dumps(data, indent=2, default=str)[:200]}...")
                except:
                    print(f"   📄 Réponse: {response.content[:200].decode('utf-8')}...")
            else:
                print(f"   ❌ Erreur: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
    
    print("\n" + "=" * 70)

def show_all_memoires_urls():
    """Affiche toutes les URLs des mémoires"""
    print("\n" + "=" * 70)
    print("📋 TOUTES LES URLS DES MÉMOIRES")
    print("=" * 70)
    
    resolver = get_resolver()
    urls = []

    def collect_urls(patterns, prefix=''):
        for pattern in patterns:
            if hasattr(pattern, 'url_patterns'):
                collect_urls(pattern.url_patterns, prefix + str(pattern.pattern))
            else:
                full_pattern = prefix + str(pattern.pattern)
                if 'memoires' in full_pattern or 'api/' in full_pattern:
                    urls.append(full_pattern)

    collect_urls(resolver.url_patterns)
    
    for url in sorted(urls):
        if 'memoires' in url:
            print(f"  ✅ {url}")

if __name__ == "__main__":
    # Afficher toutes les URLs des mémoires
    show_all_memoires_urls()
    
    # Tester les routes
    test_urls()