<div align="center">
  <img src="your-logo-path.png" alt="Metrobank Learn Logo" width="400">

  <br />
  <br />

  ### OPTIMIZING TRAINING ACCESSIBILITY: DEVELOPING AN ONLINE LEARNING WEB APPLICATION FOR METROBANK TO REDUCE OPERATIONAL COST

  <br />
</div>

---

<br />


## 📖 Project Overview
The need for an effective, adaptable, and easy-to-use learning web application in the 
corporate environment is brought about by business demands to increase employee 
development while managing the cost. This study aims to identify new ways to improve 
Metrobank’s current online learning system called MBLearn using a more effective and 
user-friendly Online Learning Web Application.

## 🎯 Technical Highlights
*   **🎨 Enhanced UX/UI** – Driving user engagement through data-driven design insights and direct employee feedback loops.
*   **📈 Expanded Course Catalog** – Targeted 10% increase in platform utilization by broadening the diversity of available professional training modules.
*   **⏱️ Administrative Efficiency** – Reducing L&D overhead by up to 50% through full digitalization, eliminating manual data entry and automating scheduling.
*   **🎯 Data Integrity** – Minimizing human error in record-keeping to ensure 100% reliable tracking of employee progress and certifications.

## 👥 Key Beneficiaries
*   **Metrobank Employees** 
    * *Enhanced learning experiences and continuous professional development of skills.*
*   **HR & Training Administrators** 
    * *Transition from manual, error-prone records to a streamlined, automated training application.*
*   **Metrobank Management** 
    * *Direct improvement in learner performance and significant reduction in training management costs.*
*   **The Organization** 
    * *Fostering a robust culture of continuous learning to build a skilled and adaptable workforce.*
  *

## 💻 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React JS, Tailwind CSS, Formik |
| **State & Routing** | React Context API, React Router |
| **Backend** | PHP 8.2 & Laravel (RESTful APIs) |
| **Database** | PostgreSQL (Neon DB) |
| **Real-time** | Pusher (WebSockets) |
| **Communications** | PhilSMS API Gateway |
| **Deployment** | Hostinger (Web Hosting) |
| **Data Fetching** | Axios |

### ⚙️ Setup & Installation

Follow these steps to get your local development environment running.

#### 1. Prerequisites
* **PHP 8.2+** & **Composer**
* **Node.js** (LTS) & **npm**
* **PostgreSQL** (or access to your Neon DB instance)

#### 2. Backend Setup (Laravel)
```bash
# Clone the repository
git clone [https://github.com/your-username/MBLearn.git](https://github.com/your-username/MBLearn.git)
cd MBLearn/backend

# Install PHP dependencies
composer install

# Create environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your Database, Pusher, and PhilSMS credentials in .env
# Run migrations
php artisan migrate
```

#### 3. Frontend Setup (React)
```bash
cd ../frontend

# Install JavaScript dependencies
npm install

# Start the development server
npm run dev
```

#### 4. Environment Configuration

Create a `.env` file in your backend directory and ensure the following core service variables are configured:

```env
# Database (Neon PostgreSQL)
DB_CONNECTION=pgsql
DB_HOST=your-neon-host
DB_PORT=5432
DB_DATABASE=your-database-name
DB_USERNAME=your-username
DB_PASSWORD=your-password

# Real-time Messaging (Pusher)
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=your-app-cluster

# SMS Gateway (PhilSMS)
PHILSMS_API_KEY=your-api-key
PHILSMS_SENDER_ID=your-sender-id
```
Note: Ensure that your .env file is included in your .gitignore to prevent sensitive credentials from being pushed to version control.

### 📂 Project Architecture
MBLearn follows a **Decoupled Client-Server Architecture**, separating the presentation layer from the business logic to ensure scalability and high performance.

#### 🏗️ High-Level Overview
*   **Frontend (Client):** A Single Page Application (SPA) built with **React JS**, utilizing **React Context API** for global state management and **Tailwind CSS** for a responsive, utility-first UI.
*   **Backend (Server):** A **Laravel RESTful API** that handles business logic, authentication, and database interactions.
*   **Real-Time Layer:** **Pusher** integration for broadcasting training updates and notifications.
*   **Database:** **PostgreSQL** hosted on **Neon**, ensuring reliable data persistence and advanced querying.

#### 📁 Directory Structure
```text
mb-learn/
├── backend/                # Laravel Application
│   ├── app/                # Core Logic (Models, Controllers, Services)
│   ├── database/           # Migrations & Seeders
│   └── routes/api.php      # REST Endpoints
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── context/        # State Management (Context API)
│   │   ├── hooks/          # Custom React Hooks
└───└───└── pages/          # View Components & Routing
```
## 👥 Development Team

**Albert A. Dela Cruz**  
*Quality Assurance (QA) Engineer*

**Jericho Manuel S. Ilanga**  
*Lead Programmer*

**Kimberly Mae D. Ramos**  
*Project Manager*

**Rogelio Gio C. Talingdan**  
*System Analyst | Full Stack Developer | UI/UX Designer*



