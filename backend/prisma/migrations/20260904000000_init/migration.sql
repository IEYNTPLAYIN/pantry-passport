CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `preferredLanguage` ENUM('en', 'nl', 'de', 'fr') NOT NULL DEFAULT 'en',
  `stripeCustomerId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `User_email_key`(`email`),
  UNIQUE INDEX `User_stripeCustomerId_key`(`stripeCustomerId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SearchHistory` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `query` VARCHAR(191) NOT NULL,
  `normalizedQuery` VARCHAR(191) NOT NULL,
  `language` ENUM('en', 'nl', 'de', 'fr') NOT NULL,
  `resultCount` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `SearchHistory_userId_createdAt_idx`(`userId`, `createdAt` DESC),
  INDEX `SearchHistory_userId_normalizedQuery_language_createdAt_idx`(`userId`, `normalizedQuery`, `language`, `createdAt` DESC),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Subscription` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `stripeCustomerId` VARCHAR(191) NULL,
  `stripeSubscriptionId` VARCHAR(191) NULL,
  `stripePriceId` VARCHAR(191) NULL,
  `stripeCheckoutSessionId` VARCHAR(191) NULL,
  `status` ENUM('INCOMPLETE', 'INCOMPLETE_EXPIRED', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID') NOT NULL DEFAULT 'CANCELED',
  `currentPeriodEnd` DATETIME(3) NULL,
  `cancelAtPeriodEnd` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `Subscription_userId_key`(`userId`),
  UNIQUE INDEX `Subscription_stripeCustomerId_key`(`stripeCustomerId`),
  UNIQUE INDEX `Subscription_stripeSubscriptionId_key`(`stripeSubscriptionId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `WebhookEvent` (
  `id` VARCHAR(191) NOT NULL,
  `stripeEventId` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `processedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `WebhookEvent_stripeEventId_key`(`stripeEventId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `SearchHistory`
  ADD CONSTRAINT `SearchHistory_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Subscription`
  ADD CONSTRAINT `Subscription_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
