# Patient-Care-System
A mobile health tracking app built with React Native, Expo, TypeScript &amp; Supabase. Records blood pressure and pulse, analyzes readings, triggers 112 emergency calls on critical values, and exports PDF reports.

### About
A mobile health tracking application that allows users to record daily blood pressure and pulse measurements, analyze data against medical norms, and generate PDF reports to share with their doctor.

### Features
- User registration and secure login (Supabase Auth)
- Daily blood pressure (systolic/diastolic) and pulse recording
- Automatic status analysis (Normal / Above Normal / High Risk / Hypertension)
- Automatic 112 emergency call trigger on critical readings
- Full measurement history listing
- Export and share full measurement history as a PDF report
- User-based data security (Row Level Security)

### Tech Stack
- React Native & Expo
- TypeScript
- Supabase (PostgreSQL, Auth, RLS)
- React Navigation (Stack & Bottom Tabs)
- expo-print & expo-sharing (PDF)

### Installation
```bash
git clone https://github.com/umutkisin583-sudo/Patient-Care-System.git
cd Patient-Care-System
npm install
npx expo start
```

### Database
The project uses `profiles` and `measurements` tables on Supabase. Row Level Security is enabled — each user can only access their own data.
