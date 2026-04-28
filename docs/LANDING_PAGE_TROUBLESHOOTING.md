# Landing Page & Click-In Functionality Troubleshooting

## Overview
Quick reference for diagnosing and fixing landing page and click-in issues in the Elo! application.

## Common Issues & Solutions

### 1. Blank Page on Load

**Symptoms:**
- White/blank screen when visiting the site
- No content visible
- Browser console may show errors

**Quick Diagnosis:**
```bash
# Check dev server status
npm run dev

# Check for build errors
npm run build

# Check browser console for JavaScript errors
```

**Common Causes:**
- Firebase environment variables missing
- Import path errors
- Component initialization failures
- TypeScript compilation errors

**Solutions:**
1. **Firebase Issues:**
   ```bash
   # Check if .env file exists
   ls -la .env
   
   # Create .env if missing
   echo "VITE_FIREBASE_API_KEY=demo-key" > .env
   ```

2. **Import Path Issues:**
   ```bash
   # Check for broken imports
   grep -r "from '\.\./" src/ components/
   
   # Fix relative imports
   # Use absolute imports from root
   ```

3. **Component Errors:**
   ```bash
   # Test with minimal component
   # Replace App.tsx with simple component to isolate issue
   ```

### 2. Click-In Flow Not Working

**Symptoms:**
- Hero component visible but clicking doesn't work
- Navigation doesn't transition to main site
- Stuck on landing page

**Quick Diagnosis:**
```typescript
// Check Hero component props
interface HeroProps {
  onEnter: () => void;
}

// Verify onEnter function is passed correctly
<Hero onEnter={() => setHasEntered(true)} />
```

**Common Causes:**
- Missing `onEnter` prop
- State management issues
- Routing problems
- Firebase auth blocking navigation

**Solutions:**
1. **Check App.tsx Logic:**
   ```typescript
   // Verify this pattern exists
   if (!hasEntered && location.pathname === '/') {
     return <Hero onEnter={() => setHasEntered(true)} />;
   }
   ```

2. **Check Navigation Logic:**
   ```typescript
   // Verify routing after entry
   if (user) {
     return <Navigate to="/dashboard" replace />;
   } else {
     return <About />;
   }
   ```

### 3. Firebase Authentication Issues

**Symptoms:**
- Infinite loading
- Auth errors in console
- Can't access protected routes

**Quick Diagnosis:**
```bash
# Check Firebase config
console.log("Firebase Config:", firebaseConfig);

# Check auth state
import { useAuth } from './hooks/useAuth';
const { user, loading } = useAuth();
console.log("Auth state:", { user, loading });
```

**Solutions:**
1. **Environment Variables:**
   ```bash
   # Add to .env
   VITE_FIREBASE_API_KEY=your-actual-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   ```

2. **Firebase Initialization:**
   ```typescript
   // Add fallbacks in firebase.ts
   export const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
     // ... other fallbacks
   };
   ```

## Diagnostic Tools

### 1. Component Isolation Testing
```typescript
// Create test component to isolate issues
export default function TestApp() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1>Test Component Working</h1>
      <button onClick={() => alert('Click working!')}>
        Test Click
      </button>
    </div>
  );
}
```

### 2. Build Verification
```bash
# Always test build
npm run build

# Check bundle size
ls -la dist/assets/

# Test production build
npm run preview
```

### 3. Git History Check
```bash
# Find last working commit
git log --oneline -10

# Revert if needed
git reset --hard <working-commit-hash>

# Force push if necessary
git push --force-with-lease origin main
```

## Quick Fix Checklist

### When Landing Page is Broken:
1. [ ] Check dev server is running
2. [ ] Run `npm run build` - check for errors
3. [ ] Check browser console for JavaScript errors
4. [ ] Verify `.env` file exists
5. [ ] Test with minimal component
6. [ ] Revert to last working commit if needed

### When Click-In Flow is Broken:
1. [ ] Check Hero component has `onEnter` prop
2. [ ] Verify `hasEntered` state management
3. [ ] Check routing logic in App.tsx
4. [ ] Test Firebase authentication
5. [ ] Check for navigation blocking

### When Build Fails:
1. [ ] Check TypeScript errors
2. [ ] Verify import paths
3. [ ] Check Firebase exports
4. [ ] Test individual components
5. [ ] Check environment variables

## Emergency Recovery

### Fast Revert to Working State:
```bash
# Revert to last known working commit
git reset --hard 6a79b36

# Force push to restore main
git push --force-with-lease origin main

# Restart dev server
npm run dev
```

### Working Version Details:
- **Commit**: `6a79b36`
- **Structure**: Original root `components/` and `hooks/`
- **Imports**: Relative paths from root
- **Firebase**: Original configuration
- **Status**: Fully functional landing page

## Prevention Tips

### Before Making Changes:
1. **Tag Working Version**: `git tag working-$(date +%Y%m%d)`
2. **Test Build**: `npm run build`
3. **Test Locally**: `npm run preview`
4. **Backup**: `git checkout -b feature-branch`

### During Development:
1. **Incremental Changes**: One change at a time
2. **Test Frequently**: Build and test after each change
3. **Check Console**: Always monitor browser console
4. **Environment Parity**: Ensure dev/staging/production match

### After Changes:
1. **Full Test**: Test complete user flow
2. **Build Verification**: Ensure production build works
3. **Deploy Test**: Test deployment before pushing
4. **Documentation**: Update any relevant docs

---

**Last Updated**: April 17, 2026  
**Status**: Active troubleshooting guide
