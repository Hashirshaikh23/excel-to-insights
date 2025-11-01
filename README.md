# Excel to Insights

A full-stack web application for uploading Excel files, analyzing data, and generating interactive 2D/3D charts. Built with Next.js and Supabase, featuring user authentication, data visualization, and an admin dashboard.

## 📋 Project Overview

This platform allows users to:
- Upload Excel files (.xls/.xlsx)
- Dynamically select X and Y axes from column headers
- Generate multiple chart types (line, bar, pie, scatter, 3D column)
- Save analysis history with persistent storage
- Download charts as PNG/PDF
- Access admin panel for usage analytics (admin users only)

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Radix UI** components
- **Recharts** for 2D charts
- **Three.js** for 3D visualizations
- **xlsx** (SheetJS) for Excel parsing

### Backend
- **Supabase** (PostgreSQL database)
- **Supabase Auth** (JWT-based authentication)
- **Row Level Security (RLS)** policies
- **Server-side API routes** (Next.js API routes)
- **AI Integration** - xAI (Grok-4) or Groq (Llama) for data insights

## ✨ Features

- ✅ **Excel File Upload & Parsing** - Supports .xls and .xlsx formats
- ✅ **Dynamic Column Mapping** - Choose X and Y axes from Excel headers
- ✅ **Multiple Chart Types** - Line, bar, pie, scatter, 3D column charts
- ✅ **Interactive Visualizations** - Responsive charts with tooltips and legends
- ✅ **AI-Powered Insights** - Generate executive summaries with key trends and outliers using AI (xAI/Groq)
- ✅ **Analysis History** - Save and revisit previous chart generations
- ✅ **User Authentication** - Secure sign-up and login with Supabase Auth
- ✅ **Admin Dashboard** - View user usage statistics (admin-only)
- ✅ **Downloadable Charts** - Export charts as PNG or PDF
- ✅ **Modern UI/UX** - Clean, responsive design with dark mode support

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (recommended)
- npm or yarn package manager
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hashirshaikh23/excel-to-insights.git
   cd excel-to-insights
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   
   # Optional: For AI Insights feature (choose one)
   XAI_API_KEY=your-xai-api-key          # Recommended: xAI Grok-4
   # OR
   GROQ_API_KEY=your-groq-api-key        # Alternative: Groq Llama
   ```

   Get these values from:
   - Supabase project settings → API
   - xAI: https://console.x.ai (for XAI_API_KEY)
   - Groq: https://console.groq.com (for GROQ_API_KEY)

4. **Set up the database**
   
   Open your Supabase SQL Editor and run these scripts in order:
   - `scripts/sql/010_create_analyses.sql` - Creates analyses table
   - `scripts/sql/011_analyses_policies.sql` - Sets up RLS policies for analyses
   - `scripts/sql/012_create_profiles.sql` - Creates profiles table and policies
   - `scripts/sql/013_admin_rpc.sql` - Creates admin RPC function

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👤 Admin Setup

After a user signs up, promote them to admin by running this SQL in Supabase:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

Then navigate to `/admin` to access the admin dashboard.

## 📁 Project Structure

```
excel-to-insights/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── admin/             # Admin dashboard
│   ├── api/                # API routes
│   └── dashboard/         # User dashboard
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   └── visuals/           # Chart rendering components
├── lib/                    # Utility functions
│   └── supabase/          # Supabase client/server config
├── scripts/               # SQL migration scripts
│   └── sql/               # Database setup scripts
└── public/                # Static assets
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Other Platforms

Make sure to:
- Set the environment variables in your hosting platform
- Run the SQL scripts in your Supabase project before first deployment
- Ensure Node.js 20+ is available in your hosting environment

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Admin functions protected by RLS policies
- JWT-based authentication via Supabase

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Supabase by Hashir


