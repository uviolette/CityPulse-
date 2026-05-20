# Multi-Language Support

The CityPulse sustainability app includes comprehensive multi-language support to serve diverse communities across the United States.

## Supported Languages

The app is available in **8 languages**:

| Language | Native Name | Code | Flag | Notes |
|----------|-------------|------|------|-------|
| English | English | `en` | 🇺🇸 | Default language |
| Spanish | Español | `es` | 🇪🇸 | 2nd most spoken in US |
| Chinese | 中文 | `zh` | 🇨🇳 | Mandarin Chinese |
| Tagalog | Tagalog | `tl` | 🇵🇭 | Filipino communities |
| Vietnamese | Tiếng Việt | `vi` | 🇻🇳 | Vietnamese-American |
| Arabic | العربية | `ar` | 🇸🇦 | Includes RTL support |
| French | Français | `fr` | 🇫🇷 | French-speaking communities |
| Korean | 한국어 | `ko` | 🇰🇷 | Korean-American |

## How to Change Language

1. **Locate the Language Selector**
   - Look for the globe icon (🌐) at the top-right corner of the app
   - It's visible on all pages when logged in

2. **Open the Language Menu**
   - Click on the globe icon
   - A dropdown menu will appear with all available languages

3. **Select Your Language**
   - Click on your preferred language
   - The app will instantly update to show all text in your selected language

4. **Persistence**
   - Your language preference is automatically saved
   - The app will remember your choice for future sessions

## Features

### Translated Content

The following app elements are translated:

- Navigation labels (Home, Activity, Action, Map)
- Button text (Submit, Cancel, Save, Close)
- Form labels (Email, Password, Description, Category)
- User profile sections (Points, Activities, Gift Cards)
- Incident categories (Energy & Climate, Waste & Recycling, etc.)
- Action types (Investigating, Monitoring, Resolved, Escalated)
- Status messages and notifications
- Settings and preferences

### Right-to-Left (RTL) Support

Arabic language includes automatic RTL support:
- Text direction changes automatically
- Layout adjusts for right-to-left reading
- Icons and UI elements mirror appropriately

### Language Persistence

- Selected language is stored in browser localStorage
- Preference persists across sessions
- No need to re-select language after closing the app

## Technical Implementation

### Language Context

The app uses React Context API for language management:

```typescript
import { useLanguage } from './contexts/LanguageContext';

function MyComponent() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <h1>{t('app.name')}</h1>
  );
}
```

### Translation Keys

Translations are organized by category:

- `nav.*` - Navigation items
- `auth.*` - Authentication forms
- `profile.*` - User profile
- `incident.*` - Incident reporting
- `category.*` - Sustainability categories
- `action.*` - Action types
- `donation.*` - Donation features
- `rewards.*` - Gift cards and rewards
- `preferences.*` - Settings
- `map.*` - Heat map features
- `activity.*` - Activity feed

### Adding New Translations

To add a new translation key:

1. Open `src/contexts/LanguageContext.tsx`
2. Add the key to the English (`en`) translations object
3. Add corresponding translations for all other languages
4. Use the key in your component: `t('your.new.key')`

## User Statistics

Based on US demographics, these 8 languages cover:
- **English**: ~230 million speakers
- **Spanish**: ~41 million speakers
- **Chinese**: ~3.5 million speakers
- **Tagalog**: ~1.7 million speakers
- **Vietnamese**: ~1.5 million speakers
- **Arabic**: ~1.2 million speakers
- **French**: ~1.2 million speakers
- **Korean**: ~1.1 million speakers

**Total Coverage**: Over 280 million people in the US can use the app in their preferred language!

## Accessibility

The language selector is designed with accessibility in mind:

- Keyboard navigable
- Screen reader compatible
- Clear visual feedback
- High contrast for readability
- Flag emojis for visual identification
- Native language names for easy recognition

## AI Chatbot Integration

The AI chatbot assistant is aware of the language feature:

- Answers questions about changing language
- Provides information about supported languages
- Suggests the language selector location
- Includes language-related FAQ responses

Ask the chatbot: "How do I change my language?" to get instant help!

## Future Enhancements

Potential improvements for language support:

- Additional languages (German, Russian, Hindi, Japanese)
- Translation of user-generated content
- Multi-language incident descriptions
- Voice assistant in multiple languages
- Community-contributed translations
- Language auto-detection based on browser settings

## Contributing Translations

If you'd like to improve or add translations:

1. Review existing translations in `LanguageContext.tsx`
2. Identify missing or incorrect translations
3. Submit improvements with context
4. Ensure cultural appropriateness
5. Test with native speakers when possible

## Support

If you encounter translation issues:

- Report via the AI chatbot
- Check if your language is supported
- Verify browser compatibility
- Clear cache if language doesn't change
- Contact support for assistance

---

**Making sustainability accessible to everyone, in every language!** 🌍🗣️
