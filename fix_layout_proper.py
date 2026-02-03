#!/usr/bin/env python3

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add useLocation to imports
content = content.replace(
    "import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';",
    "import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';"
)

# Find where to insert Layout component (before "function App()")
layout_code = '''
function Layout() {
  const location = useLocation();
  const hideNavigation = location.pathname === '/' || 
                         location.pathname.startsWith('/onboarding') ||
                         location.pathname === '/login' ||
                         location.pathname === '/complete';
  
  return !hideNavigation ? <Navigation /> : null;
}

'''

# Insert Layout before "function App()"
content = content.replace('function App() {', layout_code + 'function App() {')

with open('src/App.tsx', 'w') as f:
    f.write(content)

print('✅ Added Layout component properly')
