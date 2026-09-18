import os

# App.jsx update
app_path = '/home/john-nguembu/portail_bu/portail-frontend/src/App.jsx'
with open(app_path, 'r') as f:
    app_content = f.read()

app_content = app_content.replace(
    'PresentationPage, HorairesPage, ServicesPage,\n  RessourcesPage, ThesesPage, NotFoundPage',
    'PresentationPage, HorairesPage, ServicesPage,\n  RessourcesPage, ThesesPage, NotFoundPage,\n  CoordinationPage, SectionsPage, PolitiquePage'
)
app_content = app_content.replace(
    '<Route path="/bibliotheque/coordination"  element={<PresentationPage />} />',
    '<Route path="/bibliotheque/coordination"  element={<CoordinationPage />} />'
)
app_content = app_content.replace(
    '<Route path="/bibliotheque/sections"      element={<PresentationPage />} />',
    '<Route path="/bibliotheque/sections"      element={<SectionsPage />} />'
)
app_content = app_content.replace(
    '<Route path="/bibliotheque/politique"     element={<HorairesPage />} />',
    '<Route path="/bibliotheque/politique"     element={<PolitiquePage />} />'
)

with open(app_path, 'w') as f:
    f.write(app_content)

print("App.jsx updated.")
