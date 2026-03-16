package main

import (
	"fmt"
	"log"
	"my-ecommerce/database"
	"my-ecommerce/internal/cfg"
	internalps "my-ecommerce/internal/pkg/internalPs"
	"net/http"

	_ "my-ecommerce/docs"
	OrderHandler "my-ecommerce/internal/handlers/orders"
	PayHandel "my-ecommerce/internal/handlers/payment"
	ProductHandler "my-ecommerce/internal/handlers/products"
	UserHandler "my-ecommerce/internal/handlers/user"
	"my-ecommerce/internal/middelware"
	OrderState "my-ecommerce/internal/repository/orders"
	PaymentRepo "my-ecommerce/internal/repository/payment"
	ProductState "my-ecommerce/internal/repository/products"
	UserState "my-ecommerce/internal/repository/user"

	OrderServiceState "my-ecommerce/internal/service/orders"
	PaymentService "my-ecommerce/internal/service/payment"
	ProductServiceState "my-ecommerce/internal/service/products"
	UserServiceState "my-ecommerce/internal/service/user"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           my-ecommerce
// @version         1.0
// @description     A basic CRUD API with JWT Authentication.
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.email  support@my-ecommerce.local

// @host      localhost:8080
// @BasePath  /api

// @securityDefinitions.apikey  BearerAuth
// @in                          header
// @name                        Authorization
// @description                 Type "Bearer " followed by your JWT token.
func main() {
	r := gin.Default()

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	cfg, err := cfg.LoadConfig()
	if err != nil {
		panic(err)
	}

	db, err := internalps.ConnectDB(cfg)
	if err != nil {
		panic(err)
	}
	if err := database.SeedDatabase(db); err != nil {
		log.Fatalf("Database seeding failed: %v", err)
	}
	server := fmt.Sprintf("127.0.0.1:%s", cfg.Port)
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Ready to build!", "db": db})
	})

	//initialize repositories
	userRepo := UserState.NewUserRepository(db, cfg)
	productRepo := ProductState.NewProductRepository(db, cfg)
	orderRepo := OrderState.NewOrderRepository(db, cfg)
	paymetRepo := PaymentRepo.NewPaymentRepo(db, cfg)
	//initialize service

	userService := UserServiceState.NewService(cfg, userRepo, db)
	productService := ProductServiceState.NewProductService(cfg, productRepo, db)
	orderService := OrderServiceState.NewOrderService(cfg, orderRepo, db)
	paymetService := PaymentService.NewPaymentService(paymetRepo, orderRepo)
	//initialize handlers

	userHandler := UserHandler.NewHandler(r, userService)
	userHandler.RouteList(middelware.AuthMiddleware(cfg.JwtSecret))
	productHandler := ProductHandler.NewProductHandler(r, productService)
	productHandler.RouteList(middelware.AuthMiddleware(cfg.JwtSecret), middelware.RoleMiddleware)
	orderHandler := OrderHandler.NewOrderHandler(r, orderService)
	orderHandler.RouteList(middelware.AuthMiddleware(cfg.JwtSecret))
	paymentHandler := PayHandel.NewPaymentHandler(r, paymetService, userService)
	paymentHandler.RoutList(middelware.AuthMiddleware(cfg.JwtSecret))

	r.Run(server) // Listen on port 8080
}
