# ECOBANK Codebase Guide for AI Agents

## Project Overview
**ECOBANK for Community** is an eco-friendly waste management platform that enables users to exchange recyclable waste (plastic, paper, metal, glass) for monetary rewards. It uses a cryptocurrency-inspired interface aesthetic with Thai-English bilingual support.

## Architecture

### Directory Structure
- `BB/html&css/` - Main frontend pages (index, wallet, exchange, deposit, etc.)
- `BB/php/` - Backend server connectivity (MySQL)
- `BB/js/` - Chart.js library for data visualization
- `BB/image/` - Trash type icons (PNG images)
- `BB/ecobank_db.sql` - Database schema
- `backup/` - Archived/alternative page versions

### Core Data Model
**Trash Types** are tracked via these properties:
```
{ name, symbol (Thai), category, price (per kg), change, week, month, year, iconImage }
```
**Categories**: พลาสติก (Plastic), กระดาษ (Paper), โloหะ (Metal), แก้ว (Glass)

**Database Tables**:
- `member` - Users with username, phone, location
- `trash_types` - Recyclable waste items with price_per_unit
- `buy_trash` - Purchase transactions, linked to members
- `detail` - Transaction line items (quantity, total_price)

### Key Data Flow
1. User views waste items on `index.html` or `trash_types.html` (hardcoded data)
2. User can filter by category or time period (today/week/month/year)
3. Transactions recorded via `buy_trash` → `detail` tables
4. Wallet displays user balance and transaction history

## Frontend Patterns

### Page Structure (All pages follow this template)
```html
<!-- Header with navigation -->
<div class="header">
  <div class="logo">🌿 ECOBANK</div>
  <div class="nav"><!-- links to: index, trash_types, exchange, wallet, booths --></div>
  <div class="header-right"><!-- auth buttons or user profile --></div>
</div>

<!-- Main content container -->
<div class="container"><!-- tabs, cards, tables --></div>
```

### Styling Conventions
- **Dark Theme**: Background `#0b0e11`, borders `#2b3139`, text `#eaecef`
- **Accent Color**: `#b2ff59` (lime green) for primary highlights; `#f0b90b` (yellow) on some pages
- **Status Colors**: Green `#0ecb81` (positive), Red `#f6465d` (negative)
- **Responsive**: Mobile-first with `max-width: 900px` containers

### Common UI Components
- **Tabs**: `<div class="main-tab">` for navigation, `.sub-tab` for time periods
- **Cards**: `.ranking-card` or `.market-card` for displaying trash item data
- **Tables**: Hardcoded with inline styles, used in wallet and reports
- **Filter Dropdowns**: Category filtering (all/plastic/paper/metal/glass)

## JavaScript Patterns

### Data Rendering Pattern
```javascript
const rankingData = { 
  today: [...], 
  week: [...], 
  month: [...], 
  year: [...]
};

function renderTable() {
  let data = rankingData[currentTab];
  if (currentCategory !== 'all') {
    data = data.filter(item => item.category === currentCategory);
  }
  // Generate HTML from filtered data
}
```

### Page-Specific JavaScript Features
- **index.html**: Market overview, displays trash items in cards with inline icons
- **trash_types.html**: Full ranking table with sorting, category filtering
- **exchange.html**: Line chart showing price trends over 8 days per category
- **wallet.html**: Balance display, transaction history table
- **report.html**: Statistics cards + transaction detail table
- **deposit/withdrawal.html**: Forms with fee breakdown calculations

## Backend Integration
- `BB/php/server.php` - Single PHP file that creates MySQLi connection
- **Config**: localhost, user=root, password="" (development only), database=ecobank_db
- **Status**: Minimal—no active API endpoints; primarily schema definition

## Conventions & Important Notes

### Image References
- All images stored in `BB/image/` with naming like `ขวดพลาสติกPET.12.png` (Thai category + product name + number)
- Use relative path `../image/` from HTML files
- Fall back to emoji icons if image not found

### Thai Language Support
- All trash categories and some UI labels in Thai (เป็นไทย)
- Common terms: ขยะ (waste), กระเป๋า (wallet), ราคา (price), ปริมาณ (quantity)
- Keep bilingual: show Thai name/symbol + English product description

### Hardcoded Data vs. Database
- **Currently**: All trash data and pricing hardcoded in `<script>` sections
- **TODO**: Migrate trash arrays to database queries via PHP
- When adding new trash types, update both display arrays AND database schema

### Time Period Filtering
- All pages support periods: today, week (7 days), month (30 days), year (yearly aggregate)
- Each period has corresponding price data in the object structure
- Use `data-period` attributes on tab elements for easy filtering

### Unused/In-Development Features
- `login.html`, `register.html` - UI exists but no backend authentication
- `booths.html` - Map placeholder (shows "Map" text in box)
- Database connections initialized but queries not implemented in any page

## Testing & Local Development
1. Set up local MySQL (MariaDB 10.4+) with ecobank_db
2. Place files in web server (Apache/XAMPP) under `BB/` directory
3. Access via `http://localhost/BB/html&css/index.html`
4. No build step required—vanilla HTML/CSS/JS

## Common Tasks for Agents

### Adding a New Trash Type
1. Add entry to `rankingData` objects in relevant HTML pages (all four time periods)
2. Add icon to `BB/image/` with Thai naming convention
3. Update `trash_types` SQL table
4. Test filtering by category and time period

### Modifying Price or Styling
- Global colors: Update CSS `--` custom properties or find/replace hex codes
- Per-item pricing: Update `rankingData` arrays + SQL table
- Accent colors: Primary `#b2ff59`, secondary `#f0b90b`, status indicators

### Database Integration (Future)
- Use MySQLi prepared statements in `server.php`
- Create API endpoints returning JSON arrays matching current `rankingData` structure
- Keep field names consistent with HTML template variables (`price`, `category`, `symbol`, etc.)
