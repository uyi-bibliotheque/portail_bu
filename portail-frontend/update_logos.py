import os

# Update LoginPage.jsx
login_file = '/home/john-nguembu/portail_bu/portail-frontend/src/pages/LoginPage.jsx'
with open(login_file, 'r') as f:
    login_content = f.read()

# Add import
import_to_add = "import libraryLogo from '../assets/images/Bc_logo.png';\n"
login_content = login_content.replace(
    "import Layout from '../components/layout/Layout';",
    import_to_add + "import Layout from '../components/layout/Layout';"
)

old_logo_login = """          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'var(--bleu-nuit)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', boxShadow: 'var(--shadow-md)'
            }}>
              <BookOpen size={30} color="var(--or)" />
            </div>"""

new_logo_login = """          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              padding: 10,
              background: 'white',
              borderRadius: 12,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <img src={libraryLogo} alt="Logo BCU UYI" style={{ height: 80, width: 'auto', objectFit: 'contain' }} />
            </div>"""

login_content = login_content.replace(old_logo_login, new_logo_login)

with open(login_file, 'w') as f:
    f.write(login_content)


# Update Footer.jsx
footer_file = '/home/john-nguembu/portail_bu/portail-frontend/src/components/layout/Footer.jsx'
with open(footer_file, 'r') as f:
    footer_content = f.read()

import_to_add_footer = "import libraryLogo from '../../assets/images/Bc_logo.png';\n"
footer_content = footer_content.replace(
    "import { Link } from 'react-router-dom';",
    "import { Link } from 'react-router-dom';\n" + import_to_add_footer
)

old_logo_footer = """          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, background: 'rgba(201,168,106,0.15)',
                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <BookOpen size={22} color="var(--or)" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'white' }}>BCU UYI</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>
                  UNIVERSITÉ DE YAOUNDÉ I
                </div>
              </div>
            </div>"""

new_logo_footer = """          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, background: 'white', padding: '12px 16px', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <img src={libraryLogo} alt="Logo BCU UYI" style={{ height: 60, width: 'auto', objectFit: 'contain' }} />
            </div>"""

footer_content = footer_content.replace(old_logo_footer, new_logo_footer)

with open(footer_file, 'w') as f:
    f.write(footer_content)

print("Updates applied to LoginPage.jsx and Footer.jsx")
