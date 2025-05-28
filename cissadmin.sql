-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 15, 2025 at 09:51 AM
-- Server version: 8.0.41-0ubuntu0.22.04.1
-- PHP Version: 8.1.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cissadmin`
--

-- --------------------------------------------------------

--
-- Table structure for table `active_tokens`
--

CREATE TABLE `active_tokens` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `active_tokens`
--

INSERT INTO `active_tokens` (`id`, `user_id`, `token`, `created_at`, `updated_at`, `is_active`) VALUES
(167, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwib3RwIjozNTMzMDcsImlhdCI6MTc0NjY5ODA2MiwiZXhwIjoxNzQ2NzAxNjYyfQ.pCVBVVj4quu_JxxXmk7sL4SUlY-DLzy1KQjsG6hljm4', '2025-05-08 09:54:23', '2025-05-08 09:54:23', 1);

-- --------------------------------------------------------

--
-- Table structure for table `active_tokens_admin`
--

CREATE TABLE `active_tokens_admin` (
  `id` int NOT NULL,
  `admin_id` int NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `active_tokens_admin`
--

INSERT INTO `active_tokens_admin` (`id`, `admin_id`, `token`, `created_at`, `updated_at`, `is_active`) VALUES
(70, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzQ3MDU5ODM5LCJleHAiOjE3NDc0OTE4Mzl9.hI5jo-m6CoKSg_hYXSLDCemD3h_80oyRmISgVU8NUjc', '2025-05-12 14:23:59', '2025-05-12 14:23:59', 1);

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `user_id` int NOT NULL,
  `attempts` int DEFAULT '0',
  `last_attempt` timestamp NULL DEFAULT NULL,
  `lockout_until` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts_admin`
--

CREATE TABLE `login_attempts_admin` (
  `admin_id` int NOT NULL,
  `attempts` int DEFAULT '0',
  `last_attempt` timestamp NULL DEFAULT NULL,
  `lockout_until` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_admin`
--

CREATE TABLE `tbl_admin` (
  `id` int NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `country_code` int NOT NULL DEFAULT '91',
  `contact` varchar(255) NOT NULL,
  `about` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `imagePath` varchar(255) NOT NULL,
  `two_step_verification` enum('On','Off') NOT NULL DEFAULT 'Off',
  `date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `tbl_admin`
--

INSERT INTO `tbl_admin` (`id`, `firstname`, `lastname`, `email`, `username`, `password`, `country_code`, `contact`, `about`, `address`, `image`, `imagePath`, `two_step_verification`, `date`) VALUES
(1, 'Kilvish', 'Birla', 'admin@gmail.com', 'admin', '$2a$10$7QSe5mRdsL5rEDNhEcY/I.UckEDr2wL82uwrSk5X9g6WPQmDjJI3u', 91, '1234 567 890', 'CISS Invoice Management System can be a robust and useful addition, allowing administrators to manage users, invoices, and other essential functions. Below are some key features and considerations for your admin panel:', 'Sai Ram Plaza, 210, Mangal Nagar Road', 'profile_17470285646111.jpg', 'public\\uploads\\img_EacYUDQUMAAd9rv.jpg_1710743541008.jpg', 'On', '2023-08-14 12:15:42.000000');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_faqs`
--

CREATE TABLE `tbl_faqs` (
  `faq_id` int NOT NULL,
  `faq` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `answer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `faq_type` enum('User','Driver') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'User',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_faqs`
--

INSERT INTO `tbl_faqs` (`faq_id`, `faq`, `answer`, `faq_type`, `created_at`) VALUES
(8, 'What is your name ', 'sdfsf', 'User', '2025-05-12 08:24:44'),
(10, 'www', 'www', 'User', '2025-05-12 09:59:01');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_otp`
--

CREATE TABLE `tbl_otp` (
  `id` int NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `otp_code` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expire_at` timestamp NOT NULL DEFAULT ((now() + interval 10 minute))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_otp`
--

INSERT INTO `tbl_otp` (`id`, `email`, `otp_code`, `created_at`, `expire_at`) VALUES
(8, 'kilvishbirla@gmail.com', 624696, '2025-01-09 08:12:32', '2025-05-05 13:17:04'),
(9, 'vasubirla007@gmail.com', 353307, '2025-01-09 12:28:39', '2025-05-08 15:34:19'),
(10, 'admin@gmail.com', 654305, '2025-05-12 07:41:04', '2025-05-12 14:33:59');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_pandp`
--

CREATE TABLE `tbl_pandp` (
  `id` int NOT NULL,
  `privacy` longtext NOT NULL,
  `policy_type` enum('User','Driver','') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'User'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `tbl_pandp`
--

INSERT INTO `tbl_pandp` (`id`, `privacy`, `policy_type`) VALUES
(1, 'Demo&nbsp;', 'User');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_pass_history`
--

CREATE TABLE `tbl_pass_history` (
  `id` int NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expire_at` timestamp NOT NULL DEFAULT ((now() + interval 10 minute))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_pass_history`
--

INSERT INTO `tbl_pass_history` (`id`, `email`, `password`, `created_at`, `expire_at`) VALUES
(17, 'kilvishbirla@gmail.com', '$2a$10$o/2diB9U5Uz00KicBHsKdexi6FYFrzx227UpjouLAaxFphQQqCCLW', '2025-01-09 18:59:13', '2025-01-09 13:39:13'),
(18, 'kilvishbirla@gmail.com', '$2a$10$YcB8Ra27FBqWc4dZpzbBh.mTa23Zbbg9bdZNKonD1hYIpU2HIOiHq', '2025-01-09 19:13:00', '2025-01-09 13:53:00'),
(19, 'kilvishbirla@gmail.com', '$2a$10$Xby6BM99YBvPf4QddJr9d.IKTcqDFwwclc7lb8lVVsN1E3cPzx1o6', '2025-01-09 13:53:59', '2025-01-09 14:03:59');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_tandc`
--

CREATE TABLE `tbl_tandc` (
  `id` int NOT NULL,
  `terms` longtext NOT NULL,
  `tandc_type` enum('User','Driver','') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'User'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `tbl_tandc`
--

INSERT INTO `tbl_tandc` (`id`, `terms`, `tandc_type`) VALUES
(1, '<p><strong>Terms and Conditions Update for CISS Invoice Management System</strong></p>\r\n\r\n<p><strong>1. Acceptance of Terms</strong></p>\r\n\r\n<ul>\r\n	<li>By using the CISS Invoice Management System service provided by CISS Invoice Management System (referred to as \"CISS,\" \"we,\" \"us,\" or \"our\"), you agree to comply with and be bound by these Terms and Conditions.</li>\r\n</ul>\r\n\r\n<p><strong>2. Registration and Account Security</strong></p>\r\n\r\n<ul>\r\n	<li>You must create an account to access and use the CISS Invoice Management System platform.</li>\r\n	<li>You are responsible for maintaining the confidentiality of your account credentials and ensuring the security of your account.</li>\r\n</ul>\r\n\r\n<p><strong>3. Service Usage</strong></p>\r\n\r\n<ul>\r\n	<li>You agree to use the CISS Invoice Management System service only for lawful purposes and in compliance with all applicable laws and regulations.</li>\r\n	<li>You are responsible for all data, content, and activities associated with your account.</li>\r\n</ul>\r\n\r\n<p><strong>4. Privacy and Data Security</strong></p>\r\n\r\n<ul>\r\n	<li>CISS is committed to protecting your privacy. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.</li>\r\n</ul>\r\n\r\n<p><strong>5. Intellectual Property</strong></p>\r\n\r\n<ul>\r\n	<li>All content, trademarks, and intellectual property associated with the CISS Invoice Management System service are the property of CISS.</li>\r\n</ul>\r\n\r\n<p><strong>6. Payment and Subscription</strong></p>\r\n\r\n<ul>\r\n	<li>CISS may offer different subscription plans. By subscribing to a plan, you agree to pay the associated fees.</li>\r\n	<li>Subscription fees are non-refundable unless explicitly stated otherwise.</li>\r\n</ul>\r\n\r\n<p><strong>7. Termination</strong></p>\r\n\r\n<ul>\r\n	<li>CISS reserves the right to terminate or suspend your account and access to the CISS Invoice Management System service for any violations of these Terms and Conditions.</li>\r\n</ul>\r\n\r\n<p><strong>8. Limitation of Liability</strong></p>\r\n\r\n<ul>\r\n	<li>CISS is not liable for any indirect, incidental, or consequential damages arising from the use of the CISS Invoice Management System service.</li>\r\n</ul>\r\n\r\n<p><strong>9. Warranty Disclaimer</strong></p>\r\n\r\n<ul>\r\n	<li>The CISS Invoice Management System service is provided \"as is\" without warranties of any kind, either express or implied.</li>\r\n</ul>\r\n\r\n<p><strong>10. Governing Law</strong></p>\r\n\r\n<ul>\r\n	<li>These Terms and Conditions are governed by the laws of your jurisdiction.</li>\r\n</ul>\r\n\r\n<p><strong>11. Changes to Terms</strong></p>\r\n\r\n<ul>\r\n	<li>CISS may update these Terms and Conditions at any time. Continued use of the CISS Invoice Management System service constitutes acceptance of the new terms.</li>\r\n</ul>\r\n\r\n<p><strong>12. Contact Information</strong></p>\r\n\r\n<ul>\r\n	<li>For questions or concerns regarding these Terms and Conditions, please contact us at [Contact Email].</li>\r\n</ul>\r\n', 'User');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `active_tokens`
--
ALTER TABLE `active_tokens`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `active_tokens_admin`
--
ALTER TABLE `active_tokens_admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `login_attempts_admin`
--
ALTER TABLE `login_attempts_admin`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `tbl_admin`
--
ALTER TABLE `tbl_admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_faqs`
--
ALTER TABLE `tbl_faqs`
  ADD PRIMARY KEY (`faq_id`);

--
-- Indexes for table `tbl_otp`
--
ALTER TABLE `tbl_otp`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_pandp`
--
ALTER TABLE `tbl_pandp`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_pass_history`
--
ALTER TABLE `tbl_pass_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_tandc`
--
ALTER TABLE `tbl_tandc`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `active_tokens`
--
ALTER TABLE `active_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=168;

--
-- AUTO_INCREMENT for table `active_tokens_admin`
--
ALTER TABLE `active_tokens_admin`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `tbl_admin`
--
ALTER TABLE `tbl_admin`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tbl_faqs`
--
ALTER TABLE `tbl_faqs`
  MODIFY `faq_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tbl_otp`
--
ALTER TABLE `tbl_otp`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tbl_pandp`
--
ALTER TABLE `tbl_pandp`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_pass_history`
--
ALTER TABLE `tbl_pass_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `tbl_tandc`
--
ALTER TABLE `tbl_tandc`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
