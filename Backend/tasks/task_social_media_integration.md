# Task: Social Media Integration Foundation

## 1. Scope / Objective
- **What:** Create flexible, extensible API client architecture for multiple social media platforms with OAuth2 authentication and unified posting capabilities
- **Why:** Enable users to connect and manage multiple social media accounts from a single interface while abstracting platform differences
- **Context:** Core integration layer that enables content publishing, account management, and analytics collection across Facebook, Instagram, Twitter/X, YouTube, and Pinterest

## 2. Prerequisites & Dependencies
- User authentication system completed (task_user_authentication.md)
- Database entities for SocialAccount and related tables
- OAuth2 client dependencies configured
- HTTP client library (RestTemplate or WebClient) configured
- Redis available for rate limiting and caching

## 3. Technical Specifications
- **Integration Pattern:** Provider abstraction with platform-specific implementations
- **Authentication:** OAuth2 Authorization Code flow with PKCE
- **Rate Limiting:** Platform-specific limits with exponential backoff
- **Error Handling:** Comprehensive retry logic and user-friendly error messages
- **Data Normalization:** Consistent internal representation across platforms

## 4. Step-by-Step Implementation Guide

### Provider Abstraction Layer
1. **Create Social Provider Interface**
   - Define common operations: authenticate, post, getProfile, getAnalytics
   - Create provider metadata: identifier, displayName, requiredScopes
   - Define authentication flow methods
   - Specify rate limiting and error handling contracts

2. **Implement Provider Registry**
   - Create registry to manage all available providers
   - Support feature flagging for enabling/disabling providers
   - Provide provider discovery and metadata access
   - Handle provider-specific configuration

3. **Create Base Provider Implementation**
   - Abstract common functionality across providers
   - Implement standard OAuth2 flow handling
   - Create base rate limiting and retry logic
   - Provide common error handling patterns

### OAuth2 Integration System
4. **Implement OAuth2 Flow Handler**
   - Generate secure authorization URLs with state parameters
   - Handle callback processing and code exchange
   - Implement PKCE for enhanced security
   - Manage token storage and encryption

5. **Create Token Management Service**
   - Implement automatic token refresh
   - Handle token expiration and renewal
   - Provide token validation and cleanup
   - Support token revocation and account disconnection

6. **Set Up Callback Controllers**
   - Create platform-specific callback endpoints
   - Validate state parameters and authorization codes
   - Handle OAuth2 errors and user cancellations
   - Redirect users appropriately after authorization

### Platform-Specific Implementations
7. **Implement Facebook/Instagram Provider**
   - Set up Facebook Graph API client
   - Handle Instagram Business account requirements
   - Implement page and account selection
   - Support both Facebook and Instagram posting

8. **Create Twitter/X Provider**
   - Implement Twitter API v2 integration
   - Handle OAuth 2.0 with PKCE flow
   - Support tweet posting with media
   - Implement proper rate limiting (300 requests per 15 minutes)

9. **Implement YouTube Provider**
   - Set up Google API client for YouTube
   - Handle OAuth2 with offline access
   - Implement video upload capabilities
   - Support channel management and metadata

10. **Create Pinterest Provider**
    - Implement Pinterest API v5 integration
    - Handle board and pin management
    - Support Rich Pins functionality
    - Implement proper image handling

### Rate Limiting and Resilience
11. **Implement Rate Limiting Framework**
    - Create platform-specific rate limiters
    - Use Redis for distributed rate limiting
    - Implement exponential backoff with jitter
    - Support burst handling and queue management

12. **Add Resilience Patterns**
    - Implement circuit breaker for each provider
    - Add retry logic with exponential backoff
    - Create bulkhead isolation for providers
    - Handle timeout and connection failures

## 5. Code Examples & References

### Social Provider Interface
```java
public interface SocialProvider extends IAuthenticator, ISocialMediaIntegration {
    String identifier(); // e.g., "facebook", "twitter"
    String displayName(); // e.g., "Facebook", "Twitter/X"
    String editor(); // "normal", "markdown", "html"
    List<String> requiredScopes();
    PlatformCapabilities getCapabilities();
}

public interface IAuthenticator {
    GenerateAuthUrlResponse generateAuthUrl(ClientInfo info);
    AuthTokenDetails authenticate(String code, String codeVerifier, ClientInfo info);
    AuthTokenDetails refreshToken(String refreshToken);
}

public interface ISocialMediaIntegration {
    List<PostResponse> post(String integrationId, String accessToken, List<PostDetails> posts);
    List<AnalyticsPoint> analytics(String integrationId, String accessToken, int daysBack);
    ProfileInfo getProfile(String accessToken);
}
```

### Provider Registry
```java
@Component
public class ProviderRegistry {
    private final Map<String, SocialProvider> providers = new HashMap<>();
    
    @Autowired
    public ProviderRegistry(List<SocialProvider> providerList) {
        providerList.forEach(provider -> 
            providers.put(provider.identifier(), provider));
    }
    
    public Optional<SocialProvider> getProvider(String identifier) {
        return Optional.ofNullable(providers.get(identifier));
    }
    
    public List<ProviderMetadata> getAvailableProviders() {
        return providers.values().stream()
            .filter(this::isProviderEnabled)
            .map(this::toMetadata)
            .collect(Collectors.toList());
    }
    
    private boolean isProviderEnabled(SocialProvider provider) {
        return featureFlagService.isEnabled("provider." + provider.identifier());
    }
}
```

### OAuth2 Service
```java
@Service
public class OAuth2Service {
    
    public String generateAuthUrl(String providerId, String userId) {
        SocialProvider provider = providerRegistry.getProvider(providerId)
            .orElseThrow(() -> new ProviderNotFoundException(providerId));
        
        String state = generateSecureState(userId, providerId);
        String codeVerifier = generateCodeVerifier();
        
        // Store state and code verifier in Redis with expiration
        storeOAuthState(state, codeVerifier, userId, providerId);
        
        ClientInfo clientInfo = getClientInfo(providerId);
        return provider.generateAuthUrl(clientInfo);
    }
    
    public SocialAccount handleCallback(String providerId, String code, String state) {
        validateState(state);
        OAuthState oauthState = getStoredState(state);
        
        SocialProvider provider = providerRegistry.getProvider(providerId)
            .orElseThrow(() -> new ProviderNotFoundException(providerId));
        
        AuthTokenDetails tokens = provider.authenticate(code, oauthState.getCodeVerifier(), 
            getClientInfo(providerId));
        
        return createSocialAccount(oauthState.getUserId(), providerId, tokens);
    }
}
```

### Rate Limiting Implementation
```java
@Component
public class PlatformRateLimiter {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    public boolean isAllowed(String providerId, String operation) {
        String key = String.format("rate_limit:%s:%s", providerId, operation);
        RateLimitConfig config = getRateLimitConfig(providerId, operation);
        
        return slidingWindowRateLimit(key, config.getLimit(), config.getWindowSeconds());
    }
    
    private boolean slidingWindowRateLimit(String key, int limit, int windowSeconds) {
        long now = System.currentTimeMillis();
        long windowStart = now - (windowSeconds * 1000);
        
        // Remove old entries
        redisTemplate.opsForZSet().removeRangeByScore(key, 0, windowStart);
        
        // Count current requests
        Long currentCount = redisTemplate.opsForZSet().count(key, windowStart, now);
        
        if (currentCount < limit) {
            // Add current request
            redisTemplate.opsForZSet().add(key, UUID.randomUUID().toString(), now);
            redisTemplate.expire(key, Duration.ofSeconds(windowSeconds));
            return true;
        }
        
        return false;
    }
}
```

## 6. Testing Requirements
- **Unit Tests:** Provider implementations, OAuth2 flows, rate limiting logic
- **Integration Tests:** End-to-end OAuth2 flows with test accounts
- **Mock Tests:** External API calls with various response scenarios
- **Rate Limiting Tests:** Verify limits are enforced correctly
- **Error Handling Tests:** Test all error scenarios and recovery

## 7. Acceptance Criteria (Definition of Done)
- [ ] Provider abstraction layer implemented and tested
- [ ] OAuth2 flows working for all supported platforms
- [ ] Token management with automatic refresh working
- [ ] Rate limiting implemented and tested for all providers
- [ ] Error handling and retry logic working properly
- [ ] Account connection/disconnection flows working
- [ ] Provider registry with feature flagging operational
- [ ] Security validation (PKCE, state parameters) implemented
- [ ] Comprehensive logging and monitoring in place
- [ ] All provider integrations tested with real accounts

## 8. Best Practices Reminders
- **Security First:** Always use PKCE for OAuth2 flows and validate state parameters
- **Rate Limiting:** Respect platform limits to avoid API suspensions
- **Error Handling:** Provide clear, actionable error messages to users
- **Token Security:** Encrypt all tokens at rest and use secure transmission
- **Monitoring:** Log all API interactions for debugging and analytics
- **Resilience:** Implement proper retry logic and circuit breakers
- **Extensibility:** Design for easy addition of new platforms
