-- Lucas Agro & Naturals Database Schema Setup

-- 1. Create Database if not exists (uncomment if running as root)
-- CREATE DATABASE IF NOT EXISTS `lucas_agro_db`;
-- USE `lucas_agro_db`;

-- 2. Drop existing tables if they exist (clean setup)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `blog_posts`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `testimonials`;
DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Create Tables

-- Table: `users`
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `role` VARCHAR(20) DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: `categories`
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: `products`
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `price` DECIMAL(10, 2) NOT NULL,
  `original_price` DECIMAL(10, 2) DEFAULT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `description` TEXT NOT NULL,
  `ingredients` TEXT DEFAULT NULL,
  `benefits` TEXT DEFAULT NULL,
  `offers` TEXT DEFAULT NULL,
  `image_url` VARCHAR(2083) DEFAULT NULL,
  `subtitle` VARCHAR(255) DEFAULT NULL,
  `rating` FLOAT DEFAULT 4.5,
  `tag` VARCHAR(50) DEFAULT NULL,
  `category_id` INT DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: `orders`
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'pending',
  `payment_id` VARCHAR(255) DEFAULT NULL,
  `razorpay_order_id` VARCHAR(255) DEFAULT NULL,
  `address_line1` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `zip` VARCHAR(20) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: `order_items`
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT DEFAULT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `quantity` INT NOT NULL,
  CONSTRAINT `fk_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: `blog_posts`
CREATE TABLE `blog_posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `content` TEXT NOT NULL,
  `featured_image` VARCHAR(2083) DEFAULT NULL,
  `author_id` INT DEFAULT NULL,
  `is_published` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_post_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: `contact_messages`
CREATE TABLE `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `subject` VARCHAR(255) DEFAULT 'Product Inquiry',
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: `testimonials`
CREATE TABLE `testimonials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_name` VARCHAR(255) NOT NULL,
  `video_url` VARCHAR(2083) DEFAULT NULL,
  `rating` INT DEFAULT 5,
  `caption` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Seed Seed Data

-- Insert Categories
INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Weight Management'),
(2, 'Sugar Balance'),
(3, 'General Wellness');

-- Insert Users (Password for admin is 'Lucas@123', for Jane Doe is 'admin123')
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`) VALUES
(1, 'Admin User', 'lucasagronaturalsmedia@gmail.com', '$2b$10$lDHcuDd.J4XlLl/wSFYeHOiLDoMEZrZnIB1BaCHvThVpUVwTTtvzC', '1234567890', 'admin'),
(2, 'Jane Doe', 'jane@example.com', '$2b$10$2t/aNVNVhqKDwfk4MK4HuOccYUGy7ouFmN6Yoby85QLltrRoSV4Ee', '0987654321', 'user');

-- Insert Products
INSERT INTO `products` (`id`, `name`, `slug`, `price`, `original_price`, `stock`, `description`, `ingredients`, `benefits`, `offers`, `image_url`, `subtitle`, `rating`, `tag`, `category_id`, `is_active`, `is_featured`) VALUES
(1, 'AMALA PLUS', 'amala-plus', 1099.00, 1499.00, 50, 'Premium Ayurvedic blend for natural fat reduction.', 'Amala, Garcinia Cambogia, Green Tea Extract', 'Boosts metabolism\nSupports natural weight management\nRich in Vitamin C', 'Buy 2 Get 1 Free', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop', 'Sip & Slim', 4.8, 'Sale', 1, 1, 1),
(2, 'AVARAM POO PLUS', 'avaram-poo-plus', 1099.00, 1499.00, 45, 'Traditional support for healthy sugar balance.', 'Avaram Poo (Senna auriculata), Jamun Seed, Fenugreek', 'Helps regulate blood sugar levels\nDetoxifies the body\nImproves skin health', 'Flat 10% Off', 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&auto=format&fit=crop', 'Sugar Killer', 4.7, 'Trending', 2, 1, 1),
(3, 'HERBAL SLIM TEA', 'herbal-slim-tea', 899.00, 1200.00, 100, 'Everyday detox tea for maintaining clean digestion and shape.', 'Green Tea, Lemon Grass, Ginger', 'Enhances digestion\nPromotes fat burning\nRefreshing taste', 'New Launch Price', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop', 'Daily Detox', 4.5, 'New', 1, 1, 0);

-- Insert Testimonials
INSERT INTO `testimonials` (`id`, `customer_name`, `video_url`, `rating`, `caption`, `is_active`) VALUES
(1, 'Rajesh Kumar', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5, 'Amala Plus helped me lose 5kg in two months naturally!', 1),
(2, 'Sita Raman', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5, 'Avaram Poo Plus has kept my sugar levels perfectly stable.', 1);

-- Insert Blog Posts
INSERT INTO `blog_posts` (`id`, `title`, `slug`, `content`, `featured_image`, `author_id`, `is_published`) VALUES
(1, 'Understanding Ayurvedic Weight Loss', 'understanding-ayurvedic-weight-loss-123456', '<p>Ayurveda focuses on balancing bodily energies (doshas). Weight gain is often associated with an imbalance in Kapha dosha. Using herbs like Amala and Garcinia helps restart the metabolism naturally.</p>', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop', 1, 1),
(2, 'Natural Herbs for Controlling Blood Sugar', 'natural-herbs-for-controlling-blood-sugar-123457', '<p>Herbs like Senna auriculata (Avaram Poo) and Jamun seeds have been clinically researched to maintain optimal insulin sensitivity. Regular consumption can act as an excellent natural supplement.</p>', 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&auto=format&fit=crop', 1, 1);
