#!/usr/bin/env python3

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add useLocation import
content = content.replace(
    "import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';",
    "import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';"
)

# Create a Layout component that conditionally shows Navigation
layout_component = '''
function Layout() {
  const location = useLocation();
  const hideNavigation = location.pathname === '/' || 
                         location.pathname.startsWith('/onboarding') ||
                         location.pathname === '/login' ||
                         location.pathname === '/complete';
  
  return (
    <>
      {!hideNavigation && <Navigation />}
    </>
  );
}

'''

# Insert Layout component before main App function
content = content.replace(
    'export default function App() {',
    layout_component + 'export default function App() {'
)

# Replace standalone Navigation with Layout
content = content.replace(
    '      <Navigation />',
    '      <Layout />'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print('✅ Made Navigation conditional based on route')
