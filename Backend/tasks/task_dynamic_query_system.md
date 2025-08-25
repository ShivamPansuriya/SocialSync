# Task: Dynamic Query System Implementation

## 1. Scope / Objective
- **What:** Create a centralized, reusable dynamic query system using JPA Criteria API that can build database queries at runtime based on user input, working with any JPA entity without entity-specific code
- **Why:** Eliminate the need for static repository methods and enable flexible, type-safe query building that adapts to changing requirements without code modifications
- **Context:** Foundation component that will be used throughout the application for search, filtering, and data retrieval operations across all entities

## 2. Prerequisites & Dependencies
- Database design and entity architecture completed (task_database_design.md)
- Spring Boot project with JPA/Hibernate configured
- All core entities (User, Post, SocialAccount, etc.) implemented
- Basic repository interfaces created for entities
- Understanding of JPA Criteria API and Spring Data JPA

## 3. Technical Specifications
- **Framework:** Spring Boot with Spring Data JPA
- **Query API:** JPA Criteria API for type-safe dynamic queries
- **Architecture:** Generic repository pattern with fluent API
- **Features:** Dynamic filtering, sorting, pagination, joins, projections
- **Security:** SQL injection prevention through parameterized queries
- **Performance:** Optimized query generation with proper indexing support

## 4. Step-by-Step Implementation Guide

### Core Query Components
1. **Create CriteriaOperator Enum** (15 minutes)
   - Define all supported query operations (EQUAL, CONTAINS, GREATER_THAN, etc.)
   - Include string, numeric, date, collection, and logical operations
   - Add null check and special operations (BETWEEN, LIKE, REGEX)
   - Document each operator's purpose and supported data types

2. **Implement QueryCriteria Class** (15 minutes)
   - Create serializable criteria class with field, operator, and values
   - Add support for join types (INNER, LEFT, RIGHT)
   - Include static factory methods for easy creation
   - Add validation for operator-value compatibility

3. **Design DynamicQuery Class** (20 minutes)
   - Create comprehensive query specification class
   - Include criteria list, select fields, sort orders, pagination
   - Add distinct flag and result type specification
   - Implement builder pattern for fluent construction

### Query Builder Implementation
4. **Create DynamicQueryBuilder Service** (45 minutes)
   - Implement JPA Criteria API query construction
   - Handle WHERE clause building with complex predicates
   - Support dynamic SELECT clause with projections
   - Add ORDER BY clause with multiple sort fields
   - Implement JOIN handling for nested entity relationships

5. **Build Predicate Construction Logic** (30 minutes)
   - Create predicate builders for each CriteriaOperator
   - Handle type conversion and null safety
   - Support multi-value operations (IN, NOT_IN)
   - Add logical grouping (AND, OR) with proper precedence

6. **Implement Path Resolution** (20 minutes)
   - Create dynamic path resolution for nested properties
   - Handle join creation for relationship traversal
   - Support both inner and left joins based on criteria
   - Add validation for invalid property paths

### Repository Layer
7. **Create DynamicQueryRepository Interface** (15 minutes)
   - Extend JpaRepository with dynamic query methods
   - Add methods for List and Page results
   - Include projection support with result type specification
   - Add count and existence check methods

8. **Implement Repository Base Class** (30 minutes)
   - Create generic implementation for all dynamic query methods
   - Integrate with DynamicQueryBuilder service
   - Handle pagination and sorting
   - Add error handling and validation

### Fluent API
9. **Build FluentQueryBuilder** (25 minutes)
   - Create fluent API for programmatic query building
   - Add method chaining for where, select, orderBy operations
   - Include pagination and distinct support
   - Provide execution methods for different result types

10. **Add Configuration and Integration** (15 minutes)
    - Configure Spring to use custom repository base class
    - Set up dependency injection for query builder
    - Add configuration properties for query optimization
    - Create documentation and usage examples

## 5. Code Examples & References

### CriteriaOperator Enum
```java
public enum CriteriaOperator {
    // String Operations
    EQUAL, NOT_EQUAL, CONTAINS, DOES_NOT_CONTAIN, 
    STARTS_WITH, ENDS_WITH,
    
    // Numeric/Date Operations  
    GREATER_THAN, GREATER_THAN_OR_EQUAL,
    LESS_THAN, LESS_THAN_OR_EQUAL,
    
    // Collection Operations
    IN, NOT_IN,
    
    // Null Operations
    IS_NULL, IS_NOT_NULL,
    
    // Logical Operations
    AND, OR, NOT,
    
    // Special Operations
    BETWEEN, LIKE, REGEX
}
```

### QueryCriteria Class
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueryCriteria implements Serializable {
    private String field;
    private CriteriaOperator operator;
    private List<Object> values;
    private String joinType = "INNER";
    
    public static QueryCriteria of(String field, CriteriaOperator operator, Object... values) {
        return new QueryCriteria(field, operator, Arrays.asList(values), "INNER");
    }
    
    public static QueryCriteria leftJoin(String field, CriteriaOperator operator, Object... values) {
        return new QueryCriteria(field, operator, Arrays.asList(values), "LEFT");
    }
}
```

### DynamicQuery Class
```java
@Data
@NoArgsConstructor
public class DynamicQuery implements Serializable {
    private List<QueryCriteria> criteria = new ArrayList<>();
    private List<String> selectFields = new ArrayList<>();
    private List<SortOrder> sortOrders = new ArrayList<>();
    private boolean distinct = false;
    private Integer page;
    private Integer size;
    
    @Data
    @AllArgsConstructor
    public static class SortOrder {
        private String field;
        private Sort.Direction direction;
    }
}
```

### Repository Interface
```java
@NoRepositoryBean
public interface DynamicQueryRepository<T, ID> extends JpaRepository<T, ID> {
    List<T> findAll(List<QueryCriteria> criteria);
    Page<T> findAll(List<QueryCriteria> criteria, Pageable pageable);
    List<T> findAll(DynamicQuery dynamicQuery);
    Page<T> findAllAsPage(DynamicQuery dynamicQuery);
    <R> List<R> findAll(DynamicQuery dynamicQuery, Class<R> resultType);
    <R> Page<R> findAllAsPage(DynamicQuery dynamicQuery, Class<R> resultType);
    long count(List<QueryCriteria> criteria);
    boolean exists(List<QueryCriteria> criteria);
}
```

### Usage Example
```java
@Service
public class PostService {
    @Autowired
    private PostRepository postRepository; // extends DynamicQueryRepository<Post, Long>
    
    public List<Post> searchPosts(String title, String status, LocalDateTime fromDate) {
        return new FluentQueryBuilder<>(postRepository)
            .where("title", CriteriaOperator.CONTAINS, title)
            .and("status", CriteriaOperator.EQUAL, status)
            .and("createdDate", CriteriaOperator.GREATER_THAN_OR_EQUAL, fromDate)
            .orderBy("createdDate", Sort.Direction.DESC)
            .page(0, 20)
            .findAll();
    }
}
```

## 6. Testing Requirements
- **Unit Tests:** Test each CriteriaOperator with various data types
- **Integration Tests:** Test complete query building and execution
- **Repository Tests:** Verify all dynamic query methods work correctly
- **Performance Tests:** Benchmark query generation and execution times
- **Security Tests:** Verify SQL injection prevention
- **Edge Case Tests:** Test with null values, empty criteria, invalid paths

## 7. Acceptance Criteria (Definition of Done)
- [ ] All CriteriaOperator enum values implemented and tested
- [ ] QueryCriteria class supports all required operations
- [ ] DynamicQuery class handles complex query specifications
- [ ] DynamicQueryBuilder generates correct JPA Criteria queries
- [ ] Repository interface provides all required dynamic query methods
- [ ] FluentQueryBuilder API works for programmatic query building
- [ ] All entities can use dynamic queries without modification
- [ ] Joins work correctly for nested entity relationships
- [ ] Projections work with custom result types
- [ ] Pagination and sorting work with dynamic queries
- [ ] Performance is comparable to static queries
- [ ] Comprehensive test coverage (>90%) achieved

## 8. Best Practices Reminders
- **Type Safety:** Use JPA Criteria API to prevent SQL injection and ensure type safety
- **Performance:** Generate efficient queries with proper JOIN strategies
- **Flexibility:** Design for extensibility without breaking existing functionality
- **Security:** Validate all input parameters and field paths
- **Maintainability:** Keep query building logic centralized and well-documented
- **Testing:** Test all operator combinations with various data types
- **Error Handling:** Provide clear error messages for invalid queries or field paths
