# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Dark mode toggle functionality in navbar with sun/moon icons
- Dark mode context provider with localStorage persistence
- Comprehensive dark mode CSS styling for all components

### Fixed
- **CRITICAL**: Course card image loading issue for Hip Hop and Law Enforcement courses
- Root cause: Unsplash URLs returning binary data instead of valid images
- Solution: Replaced with self-contained base64 SVG data URIs
- Added onLoad/onError handlers for image debugging
- Fixed z-index layering so images are visible under colored overlays

### Changed
- Hip Hop course card: Purple SVG background with "Hip Hop" text (was broken mic emoji)
- Law Enforcement course card: Green SVG background with "Law Enforcement" text (was broken car emoji)
- Both cards maintain "New" badges and proper styling consistency

## [2026-04-14] - Version 1.2.0

### Added
- Dark mode toggle functionality
- Dark mode context and state management
- CSS dark mode support with proper color schemes

### Fixed
- Course card image loading failures
- Hero section copy and UI polish
- Button styling and mobile responsiveness

### Changed
- Updated hero subtext to "Comece sem pressão. Evolua no seu ritmo."
- Improved WhatsApp button styling with brand green #22C55E
- Enhanced mobile button spacing (12px minimum gap)

## [Earlier] - Version 1.1.0

### Added
- Course showcase section with multiple course cards
- Interactive enrollment system
- Authentication with Google OAuth
- Toast notification system
- Protected routes for authenticated content

### Fixed
- Initial setup and routing issues
- Authentication flow problems

---

## Technical Notes

### Course Card Image Fix (2026-04-14)
**Issue**: Hip Hop and Law Enforcement course cards showed emoji placeholders instead of images
**Root Cause**: Unsplash URLs returning binary data, not valid image content
**Solution**: 
- Replaced external URLs with self-contained base64 SVG data URIs
- Hip Hop: `data:image/svg+xml;base64,...` with purple background (#8B5CF6)
- Law Enforcement: `data:image/svg+xml;base64,...` with green background (#059669)
- Added debugging with onLoad/onError handlers
- Fixed CSS z-index layering for proper image visibility

**Benefits**:
- No external dependency on image services
- Guaranteed image loading regardless of network conditions
- Consistent visual appearance across all devices
- Faster loading (no external HTTP requests)
- Better fallback handling

### Dark Mode Implementation (2026-04-14)
**Features**:
- Navbar toggle with sun/moon icons
- System preference detection
- localStorage persistence
- Comprehensive CSS dark mode support
- Smooth transitions between themes

**Technical Details**:
- React Context API for state management
- CSS custom properties for theme switching
- Responsive design maintained in dark mode
- Proper contrast ratios for accessibility
