-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 18, 2026 at 03:25 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `digital_menu`
--

-- --------------------------------------------------------

--
-- Table structure for table `categorii`
--

CREATE TABLE `categorii` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `nume` varchar(100) NOT NULL,
  `tip` varchar(50) NOT NULL,
  `imagine_url` varchar(255) DEFAULT NULL,
  `ordine` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categorii`
--

INSERT INTO `categorii` (`id`, `nume`, `tip`, `imagine_url`, `ordine`) VALUES
(1, 'Aperitive', 'Mancare', 'aperitive.jpg\r\n', 0),
(2, 'Specialitaile Tavernei', 'Mancare', 'specialitati.jpg', 1),
(3, 'Fructe de Mare', 'Mancare', 'fructe_de_mare.jpg\r\n', 2),
(4, 'Salate', 'Mancare', 'salate.jpg\r\n', 5),
(5, 'Salate Aperitiv', 'Mancare', 'salate_a.jpg', 5),
(6, 'Peste', 'Mancare', 'peste.jpg\r\n', 3),
(7, 'Garnituri', 'Mancare', 'garnituri.jpg', 7),
(8, 'Ciorbe/Supe', 'Mancare', 'ciorbe.jpg', 8),
(9, 'Carne', 'Mancare', 'carne.jpg', 10),
(10, 'Paste', 'Mancare', 'paste.jpg', 9),
(11, 'Desert', 'Mancare', 'desert.jpg', 11),
(12, 'Soft Drinks\r\n', 'Bar', 'racoritoare.jpg', 0),
(13, 'Bere', 'Bar', 'bere.jpg', 3),
(14, 'Alcoolice', 'Bar', 'alcoolice.jpg', 1),
(15, 'Vinuri Albe', 'Vinuri', 'vinuri_albe.jpg', 0),
(16, 'Vinuri Rosii', 'Vinuri', 'vinuri_rosii.jpg', 1),
(17, 'Vinuri Rose', 'Vinuri', 'vinuri_rose.jpg', 2),
(18, 'Prosescco', 'Vinuri', 'prosecco.jpg', 3),
(19, 'Vinuri Grecesti', 'Vinuri', 'vinuri_grecesti.jpg', 4),
(20, 'Vin la Pahar', 'Vinuri', 'vin_pahar.jpg', 5),
(21, 'Cafea', 'bar', 'cafea.jpg', 5),
(22, 'Ceai', 'bar', 'ceai.jpg', 6),
(23, 'Cocktail', 'bar', 'cocktail.jpg', 2),
(24, 'Limonada', 'bar', 'limonada.jpg', 4);

-- --------------------------------------------------------

--
-- Table structure for table `produse`
--

CREATE TABLE `produse` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `nume` varchar(255) NOT NULL,
  `ingrediente` text DEFAULT NULL,
  `gramaj` int(11) DEFAULT NULL,
  `pret` int(11) NOT NULL,
  `imagine_url` varchar(255) DEFAULT NULL,
  `declaratie_nutritionala` text DEFAULT NULL,
  `categorie_id` int(11) DEFAULT NULL,
  `alergeni` text DEFAULT NULL,
  `ordine` int(11) DEFAULT 0,
  KEY `categorie_id` (`categorie_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `produse`
--

INSERT INTO `produse` (`id`, `nume`, `ingrediente`, `gramaj`, `pret`, `imagine_url`, `declaratie_nutritionala`, `categorie_id`, `alergeni`, `ordine`) VALUES
(1, 'PLACINTA CU PRAZ SI BRANZA', 'Foi placinta, praz, ou, branza', 150, 36, 'placinta_praz.jpg', 'Energie: 230.39kcal, Grasimi: 3.7g, Acizi grasi saturati: 0.99g, Glucide: 40.34g, Zaharuri: 7.24g, Fibre: 3.93g, Proteine: 10.31g, Sare: 0.71g', 1, 'Lapte, Gluten, Oua', 0),
(2, 'KEFALOTIRI', 'Branza, ulei, ou, faina', 150, 32, 'kefalotiri.jpg', 'Energie: 593.73kcal, Grasimi: 45.58g, Acizi grasi saturati: 20.44g, Glucide: 24.39g, Zaharuri: 0.31g, Fibre: 0.43g, Proteine: 20.32g, Sare: 3.1g', 1, 'Lapte, Oua, Gluten', 2),
(3, 'SAGANAKI / BOUYOURDI', 'Branza, ardei gras, rosii, ulei masline', 150, 32, 'saganaki.jpg', 'Energie: 464.13kcal, Grasimi: 37.59g, Acizi grasi saturati: 17.96g, Glucide: 7.31g, Zaharuri: 6.28g, Fibre: 1.1g, Proteine: 18.63g, Sare: 3.55g', 1, 'Lapte', 3),
(4, 'HALLOUMI', 'Branza, ulei masline, oregano', 150, 30, 'halloumi.jpg', 'Energie: 267.57kcal, Grasimi: 23.91g, Acizi grasi saturati: 12.94g, Glucide: 3.43g, Zaharuri: 0.03g, Fibre: 0.29g, Proteine: 17.89g, Sare: 2.31g', 1, 'Lapte', 4),
(5, 'BRANZA PICANTA TIROKAFTERI', 'Branza, ardei iute, rozmarin', 150, 30, 'tirokafteri.jpg', 'Energie: 301.88kcal, Grasimi: 23.71g, Acizi grasi saturati: 12.91g, Glucide: 4.19g, Zaharuri: 3.2g, Fibre: 0.69g, Proteine: 18.13g, Sare: 2.8g', 1, 'Lapte', 5),
(6, 'HUMUS', 'Naut, usturoi, ulei de masline', 150, 28, 'humus.jpg', 'Energie: 158.43kcal, Grasimi: 5.07g, Acizi grasi saturati: 0.73g, Glucide: 18.11g, Zaharuri: 0.83g, Fibre: 6.37g, Proteine: 7.01g, Sare: 0.7g', 1, NULL, 6),
(7, 'SALATA DE VINETE GRECEASCA', 'Vinete, branza, rosii, ardei gras', 150, 28, 'salata_vinete.jpg', 'Energie: 206.4kcal, Grasimi: 14.93g, Acizi grasi saturati: 6.7g, Glucide: 4.8g, Zaharuri: 6.53g, Fibre: 1.64g, Proteine: 6.43g, Sare: 1.01g', 1, 'Lapte', 7),
(8, 'SALATA ICRE STIUCA', 'Icre stiuca, ulei vegetal', 150, 36, 'icre_stiuca.jpg', 'Energie: 1448.2kcal, Grasimi: 48.5g, Acizi grasi saturati: 5.44g, Glucide: 0g, Zaharuri: 0g, Fibre: 0g, Proteine: 27g, Sare: 0g', 1, 'Peste', 8),
(9, 'SALATA ICRE DE CRAP', 'Icre de crap, ceapa, ulei', 150, 30, 'icre_crap.jpg', 'Energie: 579.07kcal, Grasimi: 52.02g, Acizi grasi saturati: 5.55g, Glucide: 1.87g, Zaharuri: 0.85g, Fibre: 0.34g, Proteine: 25.22g, Sare: 5g', 1, 'Moluste, Peste, Crustacee', 9),
(10, 'TARTAR DE SOMON', 'Somon, avocado, albus de ou, sos soia, ghimbir', 200, 48, 'tartar_somon.jpg', 'Energie: 177.5kcal, Grasimi: 9.68g, Acizi grasi saturati: 1.82g, Glucide: 3.41g, Zaharuri: 0.5g, Fibre: 0.44g, Proteine: 17.77g, Sare: 1.62g', 1, 'Oua, Soia, Peste, Telina, Gluten', 10),
(11, 'TARTAR DE CREVETI', 'Creveti, castraveti, albus de ou, sos soia, ghimbir', 200, 48, 'tartar_creveti.jpg', 'Energie: 74.94kcal, Grasimi: 0.74g, Acizi grasi saturati: 0.25g, Glucide: 2.58g, Zaharuri: 1.01g, Fibre: 0.23g, Proteine: 14.69g, Sare: 0.43g', 1, 'Oua, Crustacee, Soia', 11),
(12, 'CROCHETE CU SPANAC', 'Foi placinta, spanac, ulei', 120, 28, 'crochete_spanac.jpg', 'Energie: 327.58kcal, Grasimi: 23.93g, Acizi grasi saturati: 2.54g, Glucide: 26.62g, Zaharuri: 0.71g, Fibre: 2.78g, Proteine: 6.43g, Sare: 0.57g', 1, 'Gluten', 13),
(13, 'CROCHETE CU BRANZA', 'Foi placinta, ou, branza, ulei', 120, 28, 'crochete_branza.jpg', 'Energie: 375kcal, Grasimi: 28g, Acizi grasi saturati: 10g, Glucide: 19g, Zaharuri: 1g, Fibre: 1g, Proteine: 10g, Sare: 1.5g', 1, 'Gluten, Oua, Lapte', 14),
(14, 'CROCHETE CU 4 FELURI BRANZA', 'Branza vaca/oaie/capra, cascaval, ou, faina', 120, 28, 'crochete_4branze.jpg', 'Energie: 729.67kcal, Grasimi: 51.27g, Acizi grasi saturati: 20.68g, Glucide: 34.03g, Zaharuri: 3.68g, Fibre: 0.54g, Proteine: 30.4g, Sare: 1.25g', 1, 'Lapte, Oua, Gluten', 15),
(15, 'MASLINE PANE', 'Masline verzi, pesmet, ou, ulei', 150, 32, 'masline_pane.jpg', 'Energie: 495.87kcal, Grasimi: 30.71g, Acizi grasi saturati: 4.1g, Glucide: 46.24g, Zaharuri: 3.15g, Fibre: 1.17g, Proteine: 8.61g, Sare: 4.8g', 1, 'Gluten, Oua', 1),
(16, 'MASLINE PICANTE', 'Masline verzi/Kalamata, ardei iute, coriandru', 150, 28, 'masline_picante.jpg', 'Energie: 376.93kcal, Grasimi: 34.55g, Acizi grasi saturati: 4.51g, Glucide: 13.32g, Zaharuri: 0.95g, Fibre: 1.33g, Proteine: 1.41g, Sare: 6.7g', 1, NULL, 18),
(17, 'TZATZIKI', 'Iaurt grecesc, castraveti, usturoi, ulei masline', 150, 32, 'tzatziki.jpg', 'Energie: 115.03kcal, Grasimi: 7.11g, Acizi grasi saturati: 2.36g, Glucide: 5.51g, Zaharuri: 3.79g, Fibre: 0.24g, Proteine: 7.63g, Sare: 0.07g', 1, 'Lapte', 12),
(18, 'DOVLECEI PANE', 'Dovlecei, faina, mustar, ulei', 150, 32, 'dovlecei_pane.jpg', 'Energie: 299.33kcal, Grasimi: 19.22g, Acizi grasi saturati: 2.07g, Glucide: 27.11g, Zaharuri: 2.37g, Fibre: 1.3g, Proteine: 4.67g, Sare: 0.15g', 1, 'Mustar, Gluten', 16),
(19, 'VINETE PANE', 'Vinete, faina, mustar, ulei', 150, 32, 'vinete_pane.jpg', 'Energie: 304.67kcal, Grasimi: 19.13g, Acizi grasi saturati: 2.04g, Glucide: 28.95g, Zaharuri: 3.05g, Fibre: 2.63g, Proteine: 4.52g, Sare: 0.14g', 1, 'Mustar, Gluten', 17),
(20, 'SARMALUTE IN FOI DE VITA', 'Foi de vita, orez, menta, ulei', 150, 32, 'sarmalute.jpg', 'Energie: 181.87kcal, Grasimi: 6.36g, Acizi grasi saturati: 0.95g, Glucide: 27.39g, Zaharuri: 0.17g, Fibre: 0.47g, Proteine: 2.75g, Sare: 0.82g', 1, NULL, 20),
(21, 'SPECIALITATE CU FRUCTE DE MARE', 'Creveti, calamari, scoici, caracatita, sepie, sos rosii', 400, 98, 'specialitate_fructe_mare.jpg', 'Energie: 111.78kcal, Grasimi: 3.62g, Acizi grasi saturati: 0.77g, Glucide: 2.5g, Zaharuri: 1.06g, Fibre: 0.4g, Proteine: 15.35g, Sare: 1.11g', 2, 'Moluste, Peste, Crustacee', 2),
(25, 'SCOICI IN SOS DE VIN SI USTUROI', 'Scoici, ulei masline, busuioc, vin, ardei gras, unt', 300, 58, 'scoici_vin.jpg', 'Energie: 234.39kcal, Grasimi: 17.51g, Acizi grasi saturati: 9.22g, Glucide: 1.97g, Zaharuri: 1.03g, Fibre: 0.35g, Proteine: 8.68g, Sare: 0.51g', 3, 'Lapte, Moluste', 0),
(26, 'SCOICI IN SOS DE ROSII', 'Scoici, ulei masline, sos de rosii, rosii cherry, vin', 300, 58, 'scoici_rosii.jpg', 'Energie: 109.37kcal, Grasimi: 3.99g, Acizi grasi saturati: 0.8g, Glucide: 3.07g, Zaharuri: 1.25g, Fibre: 0.67g, Proteine: 8.95g, Sare: 0.89g', 3, 'Moluste', 1),
(27, 'SEPIE LA GRATAR', 'Sepie, ulei masline, lamaie, oregano', 200, 62, 'sepie_gratar.jpg', 'Energie: 108.6kcal, Grasimi: 1.86g, Acizi grasi saturati: 0.32g, Glucide: 2.94g, Zaharuri: 0.05g, Fibre: 0.25g, Proteine: 13.81g, Sare: 0.14g', 3, 'Moluste', 2),
(28, 'SEPIE PRAJITA', 'Sepie, faina, ulei vegetal', 200, 62, 'sepie_prajita.jpg', 'Energie: 256kcal, Grasimi: 12.7g, Acizi grasi saturati: 2g, Glucide: 16g, Zaharuri: 0.5g, Fibre: 0.5g, Proteine: 18g, Sare: 0.8g', 3, 'Moluste, Gluten', 3),
(29, 'SEPIE PICANTA CU SOS DE VIN', 'Sepie, ulei masline, vin alb, ardei iute, sos chilly, rosii cherry', 250, 62, 'sepie_picanta.jpg', 'Energie: 117.09kcal, Grasimi: 2.61g, Acizi grasi saturati: 0.4g, Glucide: 3.57g, Zaharuri: 1.04g, Fibre: 0.1g, Proteine: 11.06g, Sare: 0.31g', 3, 'Moluste, Lapte, Gluten', 4),
(30, 'CALAMARI PANE', 'Calamari, ou, faina, mustar, pesmet, ulei', 250, 62, 'calamari_pane.jpg', 'Energie: 393.44kcal, Grasimi: 22.59g, Acizi grasi saturati: 3.09g, Glucide: 24.5g, Zaharuri: 1.12g, Fibre: 0.4g, Proteine: 22.69g, Sare: 1.3g', 3, 'Moluste, Mustar, Gluten, Oua', 5),
(31, 'CALAMARI PRAJITI', 'Calamari, ou, faina, ulei vegetal', 200, 62, 'calamari_prajiti.jpg', 'Energie: 422.5kcal, Grasimi: 27.18g, Acizi grasi saturati: 3.65g, Glucide: 18.43g, Zaharuri: 0.23g, Fibre: 0.33g, Proteine: 25.73g, Sare: 1.11g', 3, 'Moluste, Oua, Gluten', 6),
(32, 'CALAMARI LA GRATAR', 'Calamari, ulei masline, lamaie, oregano', 200, 62, 'calamari_gratar.jpg', 'Energie: 110.97kcal, Grasimi: 3.44g, Acizi grasi saturati: 0.71g, Glucide: 0.56g, Zaharuri: 0.05g, Fibre: 0.25g, Proteine: 19.43g, Sare: 1g', 3, 'Moluste', 7),
(33, 'CALAMARI PICANTI', 'Calamari, vin alb, sos de rosii, sos chilly, ardei iute', 200, 62, 'calamari_picanti.jpg', 'Energie: 157.46kcal, Grasimi: 3.48g, Acizi grasi saturati: 0.7g, Glucide: 6.57g, Zaharuri: 3.37g, Fibre: 0.93g, Proteine: 20.32g, Sare: 1.82g', 3, 'Moluste, Lapte, Gluten', 8),
(34, 'CREVETI IN SOS DE COGNAC', 'Creveti, ulei masline, rosii cherry, cognac', 250, 62, 'creveti_cognac.jpg', 'Energie: 85.12kcal, Grasimi: 2.2g, Acizi grasi saturati: 0.42g, Glucide: 0.44g, Zaharuri: 0g, Fibre: 0.17g, Proteine: 11.27g, Sare: 0.72g', 3, 'Crustacee', 9),
(35, 'CREVETI PANE', 'Creveti, ou, faina, pesmet, ulei vegetal', 250, 62, 'creveti_pane.jpg', 'Energie: 474.81kcal, Grasimi: 27.49g, Acizi grasi saturati: 3.76g, Glucide: 30.43g, Zaharuri: 1.38g, Fibre: 0.2g, Proteine: 26.33g, Sare: 0.94g', 3, 'Crustacee, Gluten, Oua', 10),
(36, 'CREVETI LA GRATAR', 'Creveti, ulei masline, oregano, usturoi', 200, 62, 'creveti_gratar.jpg', 'Energie: 89.38kcal, Grasimi: 2.74g, Acizi grasi saturati: 0.54g, Glucide: 2g, Zaharuri: 0.07g, Fibre: 0.32g, Proteine: 14.37g, Sare: 0.9g', 3, 'Crustacee', 12),
(37, 'CREVETI PICANTI', 'Creveti, vin alb, sos de rosii, sos chilly, ardei iute', 250, 62, 'creveti_picanti.jpg', 'Energie: 79kcal, Grasimi: 1.5g, Acizi grasi saturati: 0.2g, Glucide: 2.6g, Zaharuri: 1g, Fibre: 0.5g, Proteine: 10.6g, Sare: 0.5g', 3, 'Crustacee', 13),
(38, 'CREVETI CU SOS DE SCORTISOARA', 'Creveti, ulei masline, vin, scortisoara', 250, 60, 'creveti_scortisoara.jpg', 'Energie: 83.42kcal, Grasimi: 2.18g, Acizi grasi saturati: 0.42g, Glucide: 0.97g, Zaharuri: 0.64g, Fibre: 0.2g, Proteine: 11.25g, Sare: 0.72g', 3, 'Crustacee', 14),
(40, 'CARACATITA LA GRATAR', 'Caracatita, ulei masline, lamaie, oregano', 180, 88, 'caracatita_gratar.jpg', 'Energie: 76.29kcal, Grasimi: 3.75g, Acizi grasi saturati: 1.11g, Glucide: 1.25g, Zaharuri: 0.73g, Fibre: 0.33g, Proteine: 10.65g, Sare: 1.79g', 3, 'Peste, Moluste', 15),
(41, 'CARACATITA PICANTA', 'Caracatita, vin alb, sos de rosii, sos chilly, ardei iute', 200, 88, 'caracatita_picanta.jpg', 'Energie: 148.81kcal, Grasimi: 3.45g, Acizi grasi saturati: 0.52g, Glucide: 7.99g, Zaharuri: 3.98g, Fibre: 1.14g, Proteine: 15.89g, Sare: 1.05g', 3, 'Moluste, Lapte, Gluten', 17),
(42, 'CARACATITA PRAJITA', 'Caracatita, ou, faina, ulei', 200, 88, 'caracatita_prajita.jpg', 'Energie: 422.5kcal, Grasimi: 27.18g, Acizi grasi saturati: 3.65g, Glucide: 18.43g, Zaharuri: 0.23g, Fibre: 0.33g, Proteine: 25.73g, Sare: 1.11g', 3, 'Moluste, Oua, Gluten', 16),
(69, 'CIUPERCI TRASE LA TIGAIE CU USTUROI', 'Ciuperci, ulei masline, usturoi', 150, 18, 'ciuperci.jpg', 'Energie: 66.04kcal, Grasimi: 3.63g, Acizi grasi saturati: 0.52g, Glucide: 5.81g, Zaharuri: 3.67g, Fibre: 1.7g, Proteine: 5.24g, Sare: 0.02g', 7, NULL, 0),
(70, 'OREZ SALBATIC', 'Orez salbatic, unt', 150, 18, 'orez_salbatic.jpg', 'Energie: 238.4kcal, Grasimi: 11.25g, Acizi grasi saturati: 6.79g, Glucide: 29.97g, Zaharuri: 1.01g, Fibre: 2.48g, Proteine: 5.99g, Sare: 0.01g', 7, 'Lapte', 1),
(71, 'CARTOFI CU ROZMARIN', 'Cartofi, ulei vegetal, usturoi, rozmarin', 150, 18, 'cartofi_rozmarin.jpg', 'Energie: 238kcal, Grasimi: 20g, Acizi grasi saturati: 2.5g, Glucide: 14g, Zaharuri: 1g, Fibre: 2g, Proteine: 1.6g, Sare: 0.1g', 7, NULL, 2),
(72, 'CARTOFI PRAJITI - CHIPS', 'Cartofi, ulei vegetal', 150, 18, 'cartofi_chips.jpg', 'Energie: 367.67kcal, Grasimi: 30.76g, Acizi grasi saturati: 3.25g, Glucide: 20.93g, Zaharuri: 1.53g, Fibre: 3.2g, Proteine: 2.24g, Sare: 0.05g', 7, NULL, 3),
(73, 'TAGLIATELE DE LEGUME', 'Dovlecei, vinete, ciuperci, usturoi', 150, 20, 'tagliatele_legume.jpg', 'Energie: 40kcal, Grasimi: 2g, Acizi grasi saturati: 0.3g, Glucide: 4g, Zaharuri: 2g, Fibre: 1.5g, Proteine: 1g, Sare: 0g', 7, NULL, 4),
(74, 'LEGUME LA GRATAR', 'Dovlecei, vinete, ciuperci, ulei masline', 150, 20, 'legume_gratar.jpg', 'Energie: 64.8kcal, Grasimi: 3.55g, Acizi grasi saturati: 0.52g, Glucide: 7.19g, Zaharuri: 4.73g, Fibre: 2.7g, Proteine: 3.13g, Sare: 0.02g', 7, NULL, 5),
(75, 'SPARANGHEL LA GRATAR', 'Sparanghel', 120, 28, 'sparanghel.jpg', 'Energie: 67.67kcal, Grasimi: 4.02g, Acizi grasi saturati: 0.6g, Glucide: 6.47g, Zaharuri: 3.13g, Fibre: 3.5g, Proteine: 3.67g, Sare: 0.01g', 7, NULL, 6),
(76, 'MAMALIGA', 'Malai, apa, sare', 100, 8, 'mamaliga.jpg', 'Energie: 70kcal, Grasimi: 0.24g, Acizi grasi saturati: 0.02g, Glucide: 15.44g, Zaharuri: 0.5g, Fibre: 0g, Proteine: 1.52g, Sare: 0.02g', 7, NULL, 7),
(77, 'CIORBA PESCAREASCA', 'Crap, somon, somn, legume, bors', 350, 36, 'ciorba_pescareasca.jpg', 'Energie: 92.66kcal, Grasimi: 3.39g, Acizi grasi saturati: 1.03g, Glucide: 6.04g, Zaharuri: 2.39g, Fibre: 1.38g, Proteine: 9.11g, Sare: 0.33g', 8, 'Peste, Soia, Telina, Moluste', 0),
(78, 'BORS DE STURION', 'Sturion, legume, bors', 350, 38, 'bors_sturion.jpg', 'Energie: 63.46kcal, Grasimi: 2.02g, Acizi grasi saturati: 0.6g, Glucide: 5.08g, Zaharuri: 2.4g, Fibre: 1.31g, Proteine: 6.42g, Sare: 0.23g', 8, 'Telina', 0),
(79, 'SUPA CU FRUCTE DE MARE', 'Calamari, midii, creveti, legume', 350, 46, 'supa_fructe_mare.jpg', 'Energie: 59.89kcal, Grasimi: 0.95g, Acizi grasi saturati: 0.17g, Glucide: 3.83g, Zaharuri: 1.65g, Fibre: 1.03g, Proteine: 8.17g, Sare: 0.39g', 8, 'Telina, Moluste, Crustacee', 0),
(80, 'SOUVLAKI DE PUI', 'Frigarui piept pui, cartofi, tzatziki, pita', 400, 48, 'souvlaki_pui.jpg', 'Energie: 286.14kcal, Grasimi: 10.19g, Acizi grasi saturati: 2.19g, Glucide: 25.16g, Zaharuri: 1.19g, Fibre: 1.6g, Proteine: 23.14g, Sare: 0.85g', 9, 'Gluten, Lapte, Oua, Crustacee, Peste, Soia, Alune, Telina, Mustar', 0),
(81, 'GYROS DE PUI', 'Pulpa pui, cartofi, tzatziki, pita', 400, 48, 'gyros_pui.jpg', 'Energie: 372.71kcal, Grasimi: 22.17g, Acizi grasi saturati: 5.58g, Glucide: 25.37g, Zaharuri: 1.19g, Fibre: 1.6g, Proteine: 18g, Sare: 0.93g', 9, 'Gluten, Lapte, Oua, Crustacee, Peste, Soia, Alune, Telina, Mustar', 1),
(82, 'GYROS DE PORC', 'Pulpa porc, cartofi, tzatziki, pita', 400, 48, 'gyros_porc.jpg', 'Energie: 324.71kcal, Grasimi: 11.9g, Acizi grasi saturati: 2.95g, Glucide: 25.16g, Zaharuri: 1.19g, Fibre: 1.6g, Proteine: 28.63g, Sare: 0.92g', 9, 'Gluten, Lapte, Oua, Crustacee, Peste, Soia, Alune, Telina, Mustar', 2),
(83, 'RASOL DE BERBECUT LA CUPTOR', 'Berbecut, condimente', 350, 64, 'rasol_berbecut.jpg', 'Energie: 524.87kcal, Grasimi: 32.01g, Acizi grasi saturati: 12.59g, Glucide: 1.36g, Zaharuri: 0.8g, Fibre: 0.07g, Proteine: 48.31g, Sare: 0.22g', 9, NULL, 3),
(84, 'SPAGHETE CU SCOICI IN SOS DE VIN', 'Spaghete, scoici greenshell, vin ', 400, 58, 'spaghete_scoici.jpg', 'Energie: 100.25kcal, Grasimi: 0.53g, Acizi grasi saturati: 0.13g, Glucide: 13.09g, Zaharuri: 1.44g, Fibre: 0.4g, Proteine: 8.07g, Sare: 0.79g', 10, 'Moluste, Gluten', 1),
(85, 'SPAGHETE CU FRUCTE DE MARE', 'Spaghete, creveti, calamari, sepie, midii, caracatita, vin,  sos de rosii', 400, 64, 'spaghete_fructe_mare.jpg', 'Energie: 125.8kcal, Grasimi: 2.38g, Acizi grasi saturati: 0.39g, Glucide: 10.46g, Zaharuri: 0.68g, Fibre: 0g, Proteine: 11.51g, Sare: 0.37g', 10, 'Moluste, Crustacee, Gluten', 0),
(86, 'SPAGHETE CU CREVETI', 'Spaghete, creveti, ardei, busuioc, rosii cherry, vin', 400, 58, 'spaghete_creveti.jpg', 'Energie: 111.17kcal, Grasimi: 1.78g, Acizi grasi saturati: 0.34g, Glucide: 11.16g, Zaharuri: 0.92g, Fibre: 0.37g, Proteine: 10.44g, Sare: 0.27g', 10, 'Crustacee, Gluten', 3),
(87, 'TAGLIATELE CU SOMON', 'Tagliatele, somon, smantana vegetala', 400, 56, 'spaghete_somon.jpg', 'Energie: 292.13kcal, Grasimi: 11.15g, Acizi grasi saturati: 5.71g, Glucide: 30.94g, Zaharuri: 2.96g, Fibre: 0g, Proteine: 15.88g, Sare: 0.57g', 10, 'Peste', 4),
(88, 'SOUFFLE DE CIOCOLATA', '', 120, 32, 'souffle.jpg', 'Energie: 415kcal, Grasimi: 25g, Acizi grasi saturati: 14g, Glucide: 40g, Zaharuri: 32g, Fibre: 2g, Proteine: 6g, Sare: 0.2g', 11, 'Oua, Lapte, Gluten, Soia', 2),
(89, 'PORTOKALOPITA', '', 180, 25, 'portokalopita.jpg', 'Energie: 260kcal, Grasimi: 10g, Acizi grasi saturati: 4g, Glucide: 38g, Zaharuri: 25g, Fibre: 1g, Proteine: 5g, Sare: 0.3g', 11, 'Gluten, Oua, Lapte', 0),
(90, 'KATAIFI / KATAIFI VANILIE', '', 180, 25, 'kataifi.jpg', 'Energie: 330kcal, Grasimi: 14g, Acizi grasi saturati: 7g, Glucide: 48g, Zaharuri: 30g, Fibre: 2g, Proteine: 4g, Sare: 0.1g', 11, 'Gluten, Lapte, Oua, Fructe cu coaja', 1),
(91, 'COLIVA LUI ZAVAT', '', 200, 25, 'coliva.jpg', 'Energie: 290kcal, Grasimi: 8g, Acizi grasi saturati: 1g, Glucide: 52g, Zaharuri: 28g, Fibre: 4g, Proteine: 6g, Sare: 0g', 11, 'Gluten, Fructe cu coaja (Nuci)', 0),
(92, 'IAURT CU MIERE SI NUCI', '', 180, 20, 'iaurt_miere.jpg', 'Energie: 160kcal, Grasimi: 9g, Acizi grasi saturati: 5g, Glucide: 16g, Zaharuri: 15g, Fibre: 0.5g, Proteine: 4g, Sare: 0.1g', 11, 'Lapte, Fructe cu coaja (Nuci)', 3),
(93, 'COCA COLA', NULL, 330, 16, 'cola.jpg', NULL, 12, NULL, 0),
(94, 'PEPSI', NULL, 330, 16, 'pepsi.jpg', NULL, 12, NULL, 2),
(95, 'FANTA', NULL, 330, 16, 'fanta.jpg', NULL, 12, NULL, 4),
(96, 'SANTAL', NULL, 200, 18, 'santal.jpg', NULL, 12, NULL, 6),
(97, 'APA PLATA', NULL, 750, 20, 'apa_plata.jpg', NULL, 12, NULL, 7),
(105, 'ZAGANU ROSIE', NULL, 330, 17, 'zaganu_rosie.jpg', NULL, 13, NULL, 0),
(106, 'ZAGANU BLONDA', NULL, 330, 17, 'zaganu_blonda.jpg', NULL, 13, NULL, 0),
(107, 'MYTHOS', NULL, 330, 15, 'mythos.jpg', NULL, 13, NULL, 0),
(108, 'CLAUSTHALER - FARA ALCOOL', NULL, 330, 14, 'clausthaler.jpg', NULL, 13, NULL, 0),
(119, 'DAVINO IACOB ALB', NULL, 750, 120, 'davino_iacob_alb.jpg', NULL, 15, NULL, 1),
(120, 'DAVINO IACOB', NULL, 750, 120, 'davino_iacob_rosu.jpg', NULL, 16, NULL, 0),
(121, 'DAVINO DOMAINE CEPTURA ROSE', NULL, 750, 180, 'davino_rose.jpg', NULL, 17, NULL, 0),
(122, 'CUARTZ ALB', NULL, 750, 90, 'cuartz_alb.jpg', NULL, 18, NULL, 0),
(123, 'RETSINA', NULL, 500, 65, 'retsina.jpg', NULL, 19, NULL, 0),
(124, 'HAMSIE PRAJITA', 'Hamsie, ulei', 200, 34, 'hamsie.jpg', 'Energie: 337.75kcal, Grasimi: 27.81g, Acizi grasi saturati: 3.7g, Glucide: 0g, Zaharuri: 0g, Fibre: 0g, Proteine: 20.4g, Sare: 0.26g', 1, 'Peste', 19),
(125, 'CALAMAR UMPLUT CU BRANZA', 'Calamar, branza, rosie, oregano', 300, 66, 'calamar_umplut.jpg', 'Energie: 186.42kcal, Grasimi: 12.03g, Acizi grasi saturati: 5.99g, Glucide: 2.35g, Zaharuri: 1.17g, Fibre: 0.26g, Proteine: 17.25g, Sare: 1.29g', 2, 'Lapte, Moluste', 0),
(126, 'CREVETI CU SOS DE UNT SI USTUROI', 'Creveti, unt, usturoi, lamaie', 250, 66, 'creveti_unt.jpg', 'Energie: 355.22kcal, Grasimi: 33.15g, Acizi grasi saturati: 20.44g, Glucide: 1.3g, Zaharuri: 0.88g, Fibre: 0.09g, Proteine: 14.68g, Sare: 0.42g', 2, 'Lapte, Crustacee', 1),
(127, 'MIXT LA GRATAR CU FRUCTE DE MARE', 'Creveti, calamari, scoici, caracatita, sepie', 400, 98, 'mixt_gratar.jpg', 'Energie: 119.3kcal, Grasimi: 3.41g, Acizi grasi saturati: 0.67g, Glucide: 2.84g, Zaharuri: 0.25g, Fibre: 0.02g, Proteine: 17.48g, Sare: 0.54g', 2, 'Moluste, Crustacee', 3),
(129, 'MIXT PRAJIT CU FRUCTE DE MARE', 'Creveti, calamari, carne midii, sepie, caracatita', 400, 98, 'mixt_prajit.jpg', 'Energie: 247.36kcal, Grasimi: 13.25g, Acizi grasi saturati: 1.64g, Glucide: 10.08g, Zaharuri: 0.45g, Fibre: 0.16g, Proteine: 19.04g, Sare: 0.81g', 2, 'Moluste, Peste, Crustacee, Gluten', 4),
(130, 'FISH & CHIPS', 'Salau, ou, pesmet, cartofi, ulei, iaurt, chilly, usturoi', 450, 72, 'fish_chips.jpg', 'Energie: 220kcal, Grasimi: 12g, Acizi grasi saturati: 2g, Glucide: 15g, Zaharuri: 1g, Fibre: 1.5g, Proteine: 10g, Sare: 0.5g', 2, 'Peste, Gluten, Oua, Lapte', 5),
(131, 'PUI DE BALTA CU BERE NEAGRA', 'Pui de balta, ciuperci, ulei masline, bere neagra', 250, 62, 'pui_balta.jpg', 'Energie: 155.28kcal, Grasimi: 2.28g, Acizi grasi saturati: 0.35g, Glucide: 1.96g, Zaharuri: 1.19g, Fibre: 0.6g, Proteine: 15.7g, Sare: 0.12g', 2, 'Gluten', 6),
(132, 'CREVETI "LA TAVERNA"', 'Creveti, dovlecei, ciuperci, ardei gras, vin alb, ulei masline', 300, 64, 'creveti_taverna.jpg', 'Energie: 93.94kcal, Grasimi: 2.27g, Acizi grasi saturati: 0.45g, Glucide: 3.12g, Zaharuri: 1.99g, Fibre: 0.68g, Proteine: 12.76g, Sare: 0.35g', 2, NULL, 7),
(133, 'CREVETI SAGANAKI', 'Creveti, ceapa alba, ardei gras, vin, ulei masline, rosii, branza', 300, 64, 'creveti_saganaki.jpg', 'Energie: 135.47kcal, Grasimi: 5.21g, Acizi grasi saturati: 2.1g, Glucide: 5.14g, Zaharuri: 2.39g, Fibre: 0.95g, Proteine: 14.52g, Sare: 0.58g', 2, 'Lapte, Crustacee', 8),
(134, 'MIDII SAGANAKI', 'Carne midii, ceapa, ardei gras, vin, ulei, rosii, branza', 300, 52, 'midii_saganaki.jpg', 'Energie: 209.6kcal, Grasimi: 9.13g, Acizi grasi saturati: 2.46g, Glucide: 5.13g, Zaharuri: 3.05g, Fibre: 1.03g, Proteine: 18.56g, Sare: 0.57g', 2, 'Lapte, Moluste', 9),
(135, 'SALATA GRECEASCA', 'Rosii, castraveti, ardei gras, ceapa, masline, branza', 300, 38, 'salata_greceasca.jpg', 'Energie: 196.83kcal, Grasimi: 17.27g, Acizi grasi saturati: 4.78g, Glucide: 5.95g, Zaharuri: 2.45g, Fibre: 0.89g, Proteine: 4.61g, Sare: 2.18g', 5, 'Lapte', 0),
(136, 'SALATA CU TON', 'Salata verde mixta, ton, ceapa, porumb', 250, 42, 'salata_ton.jpg', 'Energie: 82kcal, Grasimi: 0.34g, Acizi grasi saturati: 0.06g, Glucide: 6.47g, Zaharuri: 2.63g, Fibre: 0.92g, Proteine: 12.52g, Sare: 0.18g', 5, 'Moluste, Peste, Crustacee', 1),
(137, 'SALATA COCKTAIL DE FRUCTE DE MARE', 'Caracatita, creveti, calamari, rucola, salata mixta', 300, 54, 'salata_fructe_mare.jpg', 'Energie: 49.67kcal, Grasimi: 0.63g, Acizi grasi saturati: 0.21g, Glucide: 2.43g, Zaharuri: 0.05g, Fibre: 0g, Proteine: 9.16g, Sare: 0.4g', 5, 'Moluste, Crustacee, Telina', 2),
(138, 'SALATA CU CREVETI', 'Salata mixta, avocado, creveti, rosii cherry', 200, 52, 'salata_creveti.jpg', 'Energie: 100.03kcal, Grasimi: 4.58g, Acizi grasi saturati: 0.69g, Glucide: 5.95g, Zaharuri: 0.37g, Fibre: 1.91g, Proteine: 10.52g, Sare: 0.26g', 5, 'Crustacee', 3),
(139, 'SALATA VERDE', 'Salata verde, lamaie', 150, 18, 'salata_verde.jpg', 'Energie: 28.87kcal, Grasimi: 0.29g, Acizi grasi saturati: 0.04g, Glucide: 6.03g, Zaharuri: 1.63g, Fibre: 2.54g, Proteine: 2.41g, Sare: 0.12g', 4, NULL, 0),
(140, 'SALATA VERDE MIXTA', 'Salata verde, rucola, radicchio, lamaie', 150, 20, 'salata_mixta.jpg', 'Energie: 36.2kcal, Grasimi: 0.48g, Acizi grasi saturati: 0.16g, Glucide: 6.55g, Zaharuri: 1.12g, Fibre: 1.54g, Proteine: 3.57g, Sare: 0.09g', 4, 'Telina', 1),
(141, 'SALATA DE RUCOLA', 'Rucola, lamaie', 150, 20, 'salata_rucola.jpg', 'Energie: 25.87kcal, Grasimi: 0.42g, Acizi grasi saturati: 0.19g, Glucide: 4.09g, Zaharuri: 0.43g, Fibre: 0.37g, Proteine: 3.21g, Sare: 0.03g', 4, 'Telina', 2),
(142, 'DORADA', 'Gratar / saramura / sare / prajit', 350, 66, 'dorada.jpg', 'Energie: 445.33kcal, Grasimi: 30.42g, Acizi grasi saturati: 7.22g, Glucide: 14.78g, Zaharuri: 2.23g, Fibre: 0.86g, Proteine: 28.98g, Sare: 161.67g', 6, 'Gluten, Peste', 1),
(143, 'PASTRAV', 'Gratar / prajit / folie / saramura', 350, 52, 'pastrav.jpg', 'Energie: 380kcal, Grasimi: 21.7g, Acizi grasi saturati: 2.85g, Glucide: 14.78g, Zaharuri: 2.23g, Fibre: 0.86g, Proteine: 29.65g, Sare: 161.78g', 6, 'Peste, Gluten', 2),
(144, 'LUP DE MARE', 'Gratar / prajit / folie / saramura / sare', 350, 66, 'lup_mare.jpg', 'Energie: 424kcal, Grasimi: 25.38g, Acizi grasi saturati: 3.4g, Glucide: 14.91g, Zaharuri: 2.28g, Fibre: 0.86g, Proteine: 32.32g, Sare: 162.99g', 6, 'Peste, Gluten', 3),
(145, 'CRAP', 'Prajit, saramura, gratar', 200, 49, 'crap.jpg', 'Energie: 586kcal, Grasimi: 36.83g, Acizi grasi saturati: 4.99g, Glucide: 22.17g, Zaharuri: 3.35g, Fibre: 1.29g, Proteine: 39.08g, Sare: 0.26g', 6, 'Peste, Gluten', 4),
(146, 'MILOKOPI FILE LA PLITA', 'File de Milokopi', 250, 78, 'milokopi.jpg', 'Energie: 147kcal, Grasimi: 4.5g, Acizi grasi saturati: 0.7g, Glucide: 0g, Zaharuri: 0g, Fibre: 0g, Proteine: 25g, Sare: 0.2g', 6, 'Peste', 5),
(147, 'FAGRI LA GRATAR', 'Peste Fagri', 500, 74, 'fagri.jpg', 'Energie: 237.73kcal, Grasimi: 14.86g, Acizi grasi saturati: 5.55g, Glucide: 0g, Zaharuri: 0g, Fibre: 0g, Proteine: 26.67g, Sare: 0g', 6, 'Peste', 6),
(148, 'CALCAN FILE LA PLITA', 'File de Calcan', 200, 82, 'calcan.jpg', 'Energie: 153.6kcal, Grasimi: 6.42g, Acizi grasi saturati: 1.37g, Glucide: 0g, Zaharuri: 0g, Fibre: 0g, Proteine: 22.4g, Sare: 0.53g', 6, 'Peste', 7),
(149, 'SOMON LA GRATAR', 'File de Somon', 200, 62, 'somon_gratar.jpg', 'Energie: 334.1kcal, Grasimi: 19.99g, Acizi grasi saturati: 3.72g, Glucide: 2.73g, Zaharuri: 0g, Fibre: 0g, Proteine: 32.7g, Sare: 1.5g', 6, 'PESTE', 8),
(150, 'STURION LA GRATAR', 'Sturion', 250, 70, 'sturion.jpg', 'Energie: 142.48kcal, Grasimi: 6.68g, Acizi grasi saturati: 1.36g, Glucide: 0g, Zaharuri: 0g, Fibre: 0g, Proteine: 19.32g, Sare: 0.16g', 6, 'PESTE', 9),
(151, 'FILE DE SALAU', 'La plita, pane', 250, 56, 'salau.jpg', 'Energie: 397.04kcal, Grasimi: 23.98g, Acizi grasi saturati: 3.11g, Glucide: 15.05g, Zaharuri: 0.43g, Fibre: 0.38g, Proteine: 28.54g, Sare: 0.35g', 6, 'Peste, Mustar, Oua, Gluten', 10),
(152, 'TON FILE LA GRATAR', 'File de Ton', 200, 66, 'ton_gratar.jpg', 'Energie: 170.6kcal, Grasimi: 2.29g, Acizi grasi saturati: 0.32g, Glucide: 0g, Zaharuri: 0g, Fibre: 0g, Proteine: 34.5g, Sare: 0g', 6, 'Moluste, Peste, Crustacee', 11),
(153, 'VODKA ABSOLUT', NULL, 50, 22, 'vodca_absolut.jpg', NULL, 14, NULL, 1),
(154, 'VODKA GREY GOOSE', NULL, 50, 32, 'vodca_grey.jpg', NULL, 14, NULL, 2),
(155, 'MARTELL VS', NULL, 50, 30, 'martell.jpg', NULL, 14, NULL, 3),
(156, 'TEQUILA CAMINO', NULL, 50, 22, 'tequila.jpg', NULL, 14, NULL, 4),
(157, 'ROM HAVANA', NULL, 50, 22, 'rom_havana.jpg', NULL, 14, NULL, 5),
(158, 'THE GLENLIVET 12Y', NULL, 50, 28, 'glenlivet.jpg', NULL, 14, NULL, 6),
(159, 'BOURBON JACK DANIELS', NULL, 50, 26, 'jack_daniels.jpg', NULL, 14, NULL, 7),
(160, 'BRANDY METAXA 12*', NULL, 50, 30, 'metaxa.jpg', NULL, 14, NULL, 8),
(161, 'GRAND MARNIER', NULL, 50, 30, 'grand_marnier.jpg', NULL, 14, NULL, 9),
(162, 'OUZO', NULL, 50, 22, 'ouzo.jpg', NULL, 14, NULL, 10),
(163, 'AMMARETO DI SARONO', NULL, 50, 26, 'amaretto.jpg', NULL, 14, NULL, 11),
(164, 'JAGERMAISTER', NULL, 50, 24, 'jagermeister.jpg', NULL, 14, NULL, 12),
(165, 'AMARO MONTENEGRO', NULL, 50, 26, 'amaro.jpg', NULL, 14, NULL, 13),
(166, 'SPRITE', NULL, 330, 16, 'sprite.jpg', NULL, 12, NULL, 3),
(167, 'KINLEY', NULL, 330, 16, 'kinley.jpg', NULL, 12, NULL, 5),
(168, 'COCA COLA ZERO', NULL, 330, 16, 'cola_zero.jpg', NULL, 12, NULL, 1),
(169, 'APA MINERALA', NULL, 750, 20, 'apa_minerala.jpg', NULL, 12, NULL, 8),
(170, 'LIMONADA CLASICA', NULL, 500, 22, 'limonada_clasica.jpg', NULL, 24, NULL, 0),
(171, 'LIMONADA CU MENTA', NULL, 500, 22, 'limonada_menta.jpg', NULL, 24, NULL, 1),
(172, 'LIMONADA CU RODII', NULL, 500, 22, 'limonada_rodie.jpg', NULL, 24, NULL, 3),
(173, 'LIMONADA CU CAPSUNI', NULL, NULL, 0, 'limonada_capsuni.jpg', NULL, 24, NULL, 2),
(174, 'FRESH DE PORTOCALE', NULL, 200, 25, 'fresh_portocale.jpg', NULL, 24, NULL, 4),
(175, 'HUGO', NULL, 300, 44, 'hugo.jpg', NULL, 23, NULL, 127),
(176, 'APREOL SPRITZ', NULL, 300, 44, 'aperol.jpg', NULL, 23, NULL, 128),
(177, 'CAMPARI ORANGE', NULL, 300, 42, 'campari_orange.jpg', NULL, 23, NULL, 129),
(178, 'GIN TONIC', NULL, 300, 42, 'gin_tonic.jpg', NULL, 23, NULL, 130),
(179, 'CUBA LIBRE', NULL, 300, 42, 'cuba_libre.jpg', NULL, 23, NULL, 131),
(180, 'ESPRESSO ', NULL, 30, 14, 'espresso.jpg', NULL, 21, NULL, 132),
(181, 'CAPUCCINO', NULL, 100, 16, 'cappuccino.jpg', NULL, 21, NULL, 133),
(182, 'CAFFE LATTE', NULL, 150, 18, 'latte.jpg', NULL, 21, NULL, 134),
(183, 'FRAPPE', NULL, 200, 26, 'frappe.jpg', NULL, 21, NULL, 135),
(184, 'DAVINO DOMAINE CEPTURA BLANC', NULL, 750, 180, 'davino_blanc.jpg', NULL, 15, NULL, 0),
(185, 'GIRBOIU PETIT HELENA', NULL, 750, 190, 'garboiu_helena.jpg', NULL, 15, NULL, 2),
(186, 'GIRBOIU BACANTA CHARDONNAY', NULL, 750, 130, 'garboiu_chardonnay.jpg', NULL, 15, NULL, 3),
(187, 'GIRBOIU BACNATA SPECIAL EDT', NULL, 750, 110, 'garboiu_spec_alb.jpg', NULL, 15, NULL, 4),
(188, 'GIRBOIU EPICENTRUM', NULL, 750, 85, 'garboiu_epicentrum_alb.jpg', NULL, 15, NULL, 5),
(189, 'GIRBOIU BACANTA MERLOT', NULL, 750, 130, 'garboiu_merlot.jpg', NULL, 16, NULL, 141),
(190, 'GIRBOIU EPICENTRUM', NULL, 750, 85, 'garboiu_epicentrum_rosii.jpg', NULL, 16, NULL, 142),
(191, 'DAVINO IACOB', NULL, 750, 120, 'davino_iacob_rose.jpg', NULL, 17, NULL, 143),
(192, 'GARBOIU BACANTA SPECIAL EDT', NULL, 750, 110, 'garboiu_bacanta_special.jpg', NULL, 17, NULL, 144),
(193, 'GIRBOIU EPICENTRUM', NULL, 750, 85, 'garboiu_epicentrum_rose.jpg', NULL, 17, NULL, 145),
(194, 'EPICNETRUM ALB', NULL, 150, 27, 'epicentrum_alb.jpg', NULL, 20, NULL, 146),
(195, 'EPICENTRUM ROSU', NULL, 150, 27, 'epicentrum_rosu.jpg', NULL, 20, NULL, 147),
(196, 'EPICENTRUM ROSE', NULL, 150, 27, 'epicentrum_rose.jpg', NULL, 20, NULL, 148),
(197, 'RED BERRIES', 'Fructe de padure', 200, 14, 'redberries.jpg', NULL, 22, NULL, 149),
(198, 'SWEET GINGER', 'Bucati de mar, ghimbir, hibiscus alb, turmeric, piper negru', 200, 14, 'sweetginger.jpg', NULL, 22, NULL, 150),
(199, 'CAMOMILLE', 'Flori de musetel', 200, 14, 'camomille.jpg', NULL, 22, NULL, 151),
(200, 'PEPPERMINT', 'Frunze de menta', 200, 14, 'peppermint.jpg', NULL, 22, NULL, 152),
(201, 'WINTER DREAM', 'Bucati de scortisoara, coaja de portocala, cuisoare', 200, 14, 'winterdream.jpg', NULL, 22, NULL, 153),
(202, 'JASMINE TEA', 'Ceai verde cu iasomie', 200, 14, 'jasmine.jpg', NULL, 22, NULL, 154),
(203, 'SPAGHETE CU SCOICI IN SOS DE ROSII', 'Spaghete, scoici greenshell, sos de rosii', 400, 58, 'spaghete_scoici_r.jpg', 'Energie: 100.25kcal, Grasimi: 0.53g, Acizi grasi saturati: 0.13g, Glucide: 13.09g, Zaharuri: 1.44g, Fibre: 0.4g, Proteine: 8.07g, Sare: 0.79g', 10, 'Moluste, Gluten', 2);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `produse`
--
ALTER TABLE `produse`
  ADD CONSTRAINT `produse_ibfk_1` FOREIGN KEY (`categorie_id`) REFERENCES `categorii` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;