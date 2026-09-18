import os

file_path = '/home/john-nguembu/portail_bu/portail-frontend/src/pages/StaticPages.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Add new imports and the ImageCarousel component right after the imports
imports_addition = """
import salleLect1 from '../assets/salle lecture-1.jpg';
import salleLect2 from '../assets/salle lecture-2.jpg';
import salleLect3 from '../assets/salle lecture-3.jpg';
import salleLect4 from '../assets/salle lecture-4.jpg';
import { useState, useEffect } from 'react';

function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 450, overflow: 'hidden', borderRadius: 'var(--radius)', marginTop: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      {images.map((img, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 1s ease-in-out, transform 4s ease-in-out',
            transform: index === currentIndex ? 'scale(1.05)' : 'scale(1)',
            backgroundImage: `url("${img}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10 }}>
        {images.map((_, index) => (
          <div
            key={index}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: index === currentIndex ? 'var(--or)' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'background 0.3s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
"""

# Find where to inject imports and the new component
# I will inject it after the existing imports
import_split = content.split('function DepartmentCard({ title, subtitle, leader }) {')
content = import_split[0] + imports_addition + '\nfunction DepartmentCard({ title, subtitle, leader }) {' + import_split[1]


# 2. Modify Consultation section
old_consultation_images = """          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 10 }}>
            <div>
              <img src={salleLect} alt="Salle lecture" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius)' }} />
              <p style={{ textAlign: 'center', fontSize: 13, marginTop: 6, color: 'var(--texte-muted)' }}>Salle lecture Niveau 1</p>
            </div>
            <div>
              <img src={photo14} alt="Salle lecture 2" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius)' }} />
              <p style={{ textAlign: 'center', fontSize: 13, marginTop: 6, color: 'var(--texte-muted)' }}>Salle lecture Niveau 1 b</p>
            </div>
          </div>"""

new_consultation_images = """          <ImageCarousel images={[salleLect1, salleLect2, salleLect3, salleLect4]} />"""
content = content.replace(old_consultation_images, new_consultation_images)


# 3. Modify Wifi section
old_wifi_title = """          <h3 style={{ fontSize: 22, color: 'var(--bleu-nuit)', marginBottom: 12 }}>le WIFI s'intalle à la Bibliothèque Centrale de l'UYI!</h3>"""
new_wifi_header = """          <h3 style={{ fontSize: 28, color: 'var(--bleu-nuit)', marginBottom: 20, fontWeight: 700, borderBottom: '3px solid var(--or)', paddingBottom: 10, display: 'inline-block' }}>Accès au WIFI</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 30 }}>
            <img src={wifiImage} alt="WiFi 1" style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 'var(--radius)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
            <img src={wifiImage2} alt="WiFi 2" style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 'var(--radius)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
          </div>
          <h4 style={{ fontSize: 22, color: 'var(--bleu-nuit)', marginBottom: 12, marginTop: 30 }}>Le WIFI s'installe à la Bibliothèque Centrale de l'UYI!</h4>"""

content = content.replace(old_wifi_title, new_wifi_header)

old_wifi_images = """          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 20 }}>
            <div><img src={wifiImage} alt="WiFi 1" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius)' }} /></div>
            <div><img src={wifiImage2} alt="WiFi 2" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius)' }} /></div>
          </div>"""

content = content.replace(old_wifi_images, "")

with open(file_path, 'w') as f:
    f.write(content)

print("StaticPages.jsx modified successfully.")
