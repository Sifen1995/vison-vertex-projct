# VisionVertex E-Commerce API

A secure e-commerce backend built with **Go (Golang)**. This project features a robust authentication system with MFA and seamless Stripe and chapa integration.

## 🚀 Key Features

* **Secure Auth:** JWT-based authentication with Refresh Token rotation and Two-Factor Authentication (MFA) via TOTP.
* **Payment Gateway:** Full Stripe integration handling webhooks and payment intent lifecycle.
* **Database:** PostgreSQL/MySQL managed with **GORM**, utilizing transactions for payment finalization.
* **DevOps:** Fully containerized environment using **Docker** and **Docker Compose**.
* **API Documentation:** Interactive documentation powered by **Swagger**.
* **Code Quality:** Integrated multi-agent system (LangGraph) for security and optimization auditing.

## 🛠️ Tech Stack

* **Language:** Go 1.22+
* **Framework:** Gin Gonic
* **ORM:** GORM
* **Database:** PostgreSQL
* **Tools:** Docker, Stripe CLI, Swagger, Bcrypt

## 📋 Prerequisites

- Docker & Docker Compose
- Go 1.22 or higher
- Stripe Account (for API keys)

