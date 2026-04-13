# Sri Lanka Food Colour-Code Label Generator

A desktop application for generating print-ready nutrient color-code labels (Sugar, Salt, Fat) for solid/semi-solid foods, compliant with Sri Lanka Gazette No. 2119/3.

## Features

- **Nutrient Input**: Enter per-100g values for sugar, salt, and fat
- **Automatic Color Assignment**: Colors are automatically assigned based on Gazette thresholds
- **Product Metadata**: Title, MRP, MFD, EXP, Batch No, subtitle, and footer lines
- **Live Preview**: A4 sheet preview with millimeter-based dimensions
- **PDF Export**: Export to PDF via Electron's printToPDF
- **Palette Override**: Customize colors for legal review workflows
- **Preset Management**: Save and load label configurations

## Gazette Thresholds

| Nutrient | Green (Low) | Amber (Medium) | Red (High) |
|----------|-------------|----------------|------------|
| Sugar    | < 5g        | 5g - 22g       | > 22g      |
| Salt     | < 0.25g     | 0.25g - 1.25g  | > 1.25g    |
| Fat      | < 3g        | 3g - 17.5g     | > 17.5g    |

Minimum nutrient logo dimensions: 20mm (height) × 10mm (width)

## Tech Stack

- **Electron** - Desktop framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Vitest** - Testing

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Project Structure

```
├── electron/          # Electron main process
│   ├── main.cjs       # Main entry point
│   └── preload.cjs    # Preload script
├── src/
│   ├── App.tsx        # Main React application
│   ├── components/    # React components
│   ├── shared/        # Shared utilities
│   │   ├── compliance.ts   # Gazette color logic
│   │   ├── layout.ts        # Layout calculations
│   │   ├── printHtml.ts     # HTML generation
│   │   └── types.ts         # TypeScript types
│   └── styles.css     # Application styles
├── tests/             # Test files
└── package.json       # Project configuration
```

## License

MIT
