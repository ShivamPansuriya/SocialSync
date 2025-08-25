# Task: Database Design & Entity Architecture

## 1. Scope / Objective
- **What:** Design and implement foundational database entities and relationships that support all current and future SocialSync features
- **Why:** Create a stable, scalable database foundation that won't require structural changes as features are added
- **Context:** Core data model that supports user management, social media integration, content management, and analytics

## 2. Prerequisites & Dependencies
- Project structure setup completed (task_project_setup.md)
- PostgreSQL database running and accessible
- Flyway migration tool configured
- JPA/Hibernate dependencies included in project

## 3. Technical Specifications
- **Database:** PostgreSQL 14+ with JSONB support
- **ORM:** Spring Data JPA with Hibernate
- **Migration Tool:** Flyway for version-controlled schema changes
- **Key Features:** Audit trails, soft deletes, UUID primary keys, proper indexing
- **Security:** Encrypted storage for sensitive data (tokens, passwords)

## 4. Step-by-Step Implementation Guide

### Core Entity Design
1. **Create BaseEntity Abstract Class**
   - Add common fields: id (UUID), createdAt, updatedAt, deletedAt
   - Implement audit trail functionality
   - Add version field for optimistic locking
   - Create soft delete functionality

2. **Design User Entity**
   - Fields: email, passwordHash, firstName, lastName, profileImageUrl
   - Add timezone, emailVerified, accountStatus, subscriptionPlan
   - Include preferences as JSONB field
   - Implement proper validation annotations

3. **Create SocialAccount Entity**
   - Fields: userId, platform, platformUserId, username, displayName
   - Add encrypted token fields: accessToken, refreshToken, tokenExpiresAt
   - Include accountStatus, permissions, platformMetadata
   - Set up proper foreign key relationships

4. **Design Post Entity**
   - Fields: userId, title, content, contentType, status
   - Add scheduling fields: scheduledAt, publishedAt
   - Include templateId reference, mediaFiles array, hashtags, mentions
   - Add platformSettings and analyticsData as JSONB

5. **Create PostPlatform Junction Entity**
   - Link posts to specific social accounts
   - Track platform-specific post IDs and URLs
   - Store platform-specific data and status
   - Handle publishing errors and retry logic

### Supporting Entities
6. **Design Schedule Entity**
   - Support one-time and recurring schedules
   - Include recurrence patterns as JSONB
   - Add timezone handling and execution tracking
   - Support optimal timing calculations

7. **Create MediaFile Entity**
   - Handle all media types: images, videos, audio, documents
   - Store file metadata, dimensions, duration
   - Include processing status and thumbnail paths
   - Support tagging and organization

8. **Design Template Entity**
   - Support post, video, and story templates
   - Store template configuration as JSONB
   - Include categorization and rating system
   - Support public/private templates

9. **Create Analytics Entity**
   - Store time-series analytics data
   - Support multiple metric types per post
   - Include raw platform data for traceability
   - Optimize for time-based queries

### Database Migration Setup
10. **Set Up Flyway Configuration**
    - Configure migration file naming convention
    - Set up environment-specific migration paths
    - Create rollback procedures
    - Set up data seeding for reference data

## 5. Code Examples & References

### BaseEntity Example
```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    private LocalDateTime deletedAt;
    
    @Version
    private Long version;
    
    // Getters and setters
}
```

### User Entity Example
```java
@Entity
@Table(name = "users")
public class User extends BaseEntity {
    @Column(unique = true, nullable = false)
    @Email
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @Column(length = 100)
    private String firstName;
    
    @Column(length = 100)
    private String lastName;
    
    @Column(length = 500)
    private String profileImageUrl;
    
    @Column(length = 50)
    private String timezone = "UTC";
    
    @Column(nullable = false)
    private Boolean emailVerified = false;
    
    @Enumerated(EnumType.STRING)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;
    
    @Enumerated(EnumType.STRING)
    private SubscriptionPlan subscriptionPlan = SubscriptionPlan.FREE;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> preferences = new HashMap<>();
    
    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<SocialAccount> socialAccounts = new ArrayList<>();
    
    // Getters and setters
}
```

### Migration Script Example
```sql
-- V1__Create_users_table.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    email_verified BOOLEAN DEFAULT FALSE,
    account_status VARCHAR(20) DEFAULT 'ACTIVE',
    subscription_plan VARCHAR(20) DEFAULT 'FREE',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(account_status) WHERE deleted_at IS NULL;
```

## 6. Testing Requirements
- **Unit Tests:** Entity validation and relationship tests
- **Integration Tests:** Repository layer tests with test database
- **Migration Tests:** Verify all migrations run successfully
- **Performance Tests:** Query performance with sample data
- **Data Integrity Tests:** Foreign key constraints and validation

## 7. Acceptance Criteria (Definition of Done)
- [ ] All core entities created with proper annotations
- [ ] Database migrations run successfully in all environments
- [ ] Entity relationships properly configured and tested
- [ ] Audit trail functionality working for all entities
- [ ] Soft delete functionality implemented and tested
- [ ] Proper indexing strategy implemented
- [ ] Encrypted fields working for sensitive data
- [ ] Repository interfaces created for all entities
- [ ] Basic CRUD operations tested for all entities
- [ ] Database constraints and validations working

## 8. Best Practices Reminders
- **Data Integrity:** Use proper foreign key constraints and validation
- **Performance:** Create indexes for all anticipated query patterns
- **Security:** Encrypt all sensitive data at rest
- **Scalability:** Design for future partitioning and sharding needs
- **Audit Trail:** Track all data modifications for compliance
- **Soft Deletes:** Never hard delete data; use soft deletes for recovery
- **Version Control:** All schema changes must go through migration scripts
