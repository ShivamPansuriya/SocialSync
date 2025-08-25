# Task: Content Management System (Web & Mobile)

## 1. Scope / Objective
- **What:** Build comprehensive content creation, editing, and management system supporting multiple content types and platform-specific optimizations across web and mobile platforms
- **Why:** Enable users to create, organize, and manage social media content efficiently with platform-specific optimizations and reusable components, leveraging native mobile capabilities
- **Context:** Core content workflow that bridges user creativity with social media platform requirements, supporting text, images, videos, and mixed media posts with native camera integration and mobile-optimized editing

## 2. Prerequisites & Dependencies
- Database design with Post, MediaFile, and Template entities completed
- User authentication system operational
- Social media integration foundation established
- File upload and storage system configured
- Media processing capabilities available

## 3. Technical Specifications
- **Content Types:** Text posts, image posts, video posts, carousel posts, stories
- **Media Support:** Images (JPG, PNG, GIF), Videos (MP4, MOV, AVI), Audio files
- **Storage:** Cloud storage (S3/GCS) with CDN for delivery
- **Processing:** Image optimization, video transcoding, thumbnail generation
- **Validation:** Platform-specific content validation and optimization
- **Mobile Features:** Native camera integration, photo library access, real-time filters
- **Offline Support:** Local content drafts with sync when online

## 4. Step-by-Step Implementation Guide

### Content Creation Foundation
1. **Create Post Service Layer**
   - Implement CRUD operations for posts
   - Add content validation and sanitization
   - Support draft, scheduled, and published states
   - Handle platform-specific content requirements

2. **Design Content DTOs**
   - CreatePostRequest with validation annotations
   - UpdatePostRequest for content modifications
   - PostResponse with platform-specific data
   - ContentPreviewResponse for platform previews

3. **Implement Content Validation**
   - Character limits per platform (Twitter: 280, Facebook: 63,206)
   - Media file size and format validation
   - Hashtag and mention validation
   - Content policy compliance checking

### Media Management System
4. **Create Media Upload Service**
   - Implement secure file upload with virus scanning
   - Support drag-and-drop and bulk uploads
   - Generate unique file names and paths
   - Create thumbnails and preview images

5. **Implement Media Processing Pipeline**
   - Image optimization and resizing
   - Video transcoding for platform requirements
   - Metadata extraction (dimensions, duration, etc.)
   - Background processing with job queues

6. **Design Media Organization**
   - Folder-based organization system
   - Tagging and categorization
   - Search functionality with filters
   - Bulk operations for media management

### Content Library and Templates
7. **Create Content Library Service**
   - Organize content in hierarchical folders
   - Implement tagging and search functionality
   - Support content versioning and history
   - Enable content sharing and collaboration

8. **Implement Template System**
   - Create reusable content templates
   - Support template categories and ratings
   - Enable template sharing and marketplace
   - Implement template customization

9. **Add Content Analytics Integration**
   - Track content performance metrics
   - Provide content optimization suggestions
   - Support A/B testing for content variations
   - Generate content performance reports

### Platform-Specific Optimization
10. **Implement Platform Content Adapters**
    - Facebook: Link previews, image sizing, character limits
    - Instagram: Square/portrait optimization, hashtag limits
    - Twitter/X: Character counting, media limits, thread support
    - YouTube: Video requirements, thumbnail generation
    - Pinterest: Image optimization, Rich Pins support

11. **Create Content Preview System**
    - Generate platform-specific previews
    - Show character counts and limits
    - Display media optimization results
    - Provide publishing recommendations

12. **Add Content Scheduling Integration**
    - Link content to scheduling system
    - Support bulk scheduling operations
    - Handle timezone conversions
    - Provide optimal timing suggestions

### Mobile Content Creation Features
13. **Implement Native Camera Integration**
    - Integrate device camera for photo and video capture
    - Add real-time filters and editing capabilities
    - Support multiple camera modes (photo, video, portrait)
    - Implement camera permissions and error handling

14. **Create Mobile Media Management**
    - Access device photo library and gallery
    - Implement image cropping and basic editing
    - Add video trimming and compression
    - Support batch media selection and upload

15. **Add Mobile Content Editor**
    - Create touch-optimized content editing interface
    - Implement swipe gestures for navigation
    - Add voice-to-text functionality for content creation
    - Support offline content creation with local storage

16. **Implement Mobile-Specific Features**
    - Add location-based content suggestions
    - Implement native sharing capabilities
    - Create quick post templates for mobile
    - Add haptic feedback for user interactions

## 5. Code Examples & References

### Post Service Implementation
```java
@Service
@Transactional
public class PostService {
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private MediaFileService mediaFileService;
    
    @Autowired
    private ContentValidationService validationService;
    
    public PostResponse createPost(CreatePostRequest request, String userId) {
        // Validate content
        validationService.validateContent(request);
        
        // Create post entity
        Post post = new Post();
        post.setUserId(UUID.fromString(userId));
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setContentType(request.getContentType());
        post.setStatus(PostStatus.DRAFT);
        
        // Handle media files
        if (request.getMediaFileIds() != null) {
            List<MediaFile> mediaFiles = mediaFileService.getMediaFiles(request.getMediaFileIds());
            post.setMediaFiles(mediaFiles.stream()
                .map(MediaFile::getId)
                .map(UUID::toString)
                .collect(Collectors.toList()));
        }
        
        // Set hashtags and mentions
        post.setHashtags(extractHashtags(request.getContent()));
        post.setMentions(extractMentions(request.getContent()));
        
        Post savedPost = postRepository.save(post);
        return mapToResponse(savedPost);
    }
    
    public PostResponse updatePost(String postId, UpdatePostRequest request, String userId) {
        Post post = postRepository.findByIdAndUserId(UUID.fromString(postId), UUID.fromString(userId))
            .orElseThrow(() -> new PostNotFoundException(postId));
        
        // Validate update permissions
        if (post.getStatus() == PostStatus.PUBLISHED) {
            throw new PostAlreadyPublishedException(postId);
        }
        
        // Update fields
        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent());
            post.setHashtags(extractHashtags(request.getContent()));
            post.setMentions(extractMentions(request.getContent()));
        }
        
        Post updatedPost = postRepository.save(post);
        return mapToResponse(updatedPost);
    }
}
```

### Content Validation Service
```java
@Service
public class ContentValidationService {
    
    private final Map<String, PlatformValidator> validators = new HashMap<>();
    
    public void validateContent(CreatePostRequest request) {
        // Basic validation
        if (StringUtils.isBlank(request.getContent()) && 
            CollectionUtils.isEmpty(request.getMediaFileIds())) {
            throw new ValidationException("Post must have content or media");
        }
        
        // Platform-specific validation
        if (request.getTargetPlatforms() != null) {
            for (String platform : request.getTargetPlatforms()) {
                PlatformValidator validator = validators.get(platform);
                if (validator != null) {
                    validator.validate(request);
                }
            }
        }
    }
    
    @Component
    public static class TwitterValidator implements PlatformValidator {
        @Override
        public void validate(CreatePostRequest request) {
            if (request.getContent().length() > 280) {
                throw new ValidationException("Twitter posts cannot exceed 280 characters");
            }
            
            if (request.getMediaFileIds() != null && request.getMediaFileIds().size() > 4) {
                throw new ValidationException("Twitter posts cannot have more than 4 media files");
            }
        }
    }
}
```

### Media Upload Controller
```java
@RestController
@RequestMapping("/api/v1/media")
public class MediaController {
    
    @Autowired
    private MediaFileService mediaFileService;
    
    @PostMapping("/upload")
    public ResponseEntity<MediaFileResponse> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "tags", required = false) List<String> tags,
            Authentication authentication) {
        
        // Validate file
        validateMediaFile(file);
        
        // Upload and process
        MediaFileResponse response = mediaFileService.uploadMedia(file, tags, 
            authentication.getName());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/upload/bulk")
    public ResponseEntity<List<MediaFileResponse>> uploadMultipleMedia(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "tags", required = false) List<String> tags,
            Authentication authentication) {
        
        List<MediaFileResponse> responses = files.stream()
            .map(file -> {
                validateMediaFile(file);
                return mediaFileService.uploadMedia(file, tags, authentication.getName());
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    private void validateMediaFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ValidationException("File cannot be empty");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ValidationException("File size exceeds maximum limit");
        }
        
        String contentType = file.getContentType();
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ValidationException("File type not supported");
        }
    }
}
```

### Content Preview Service
```java
@Service
public class ContentPreviewService {
    
    public Map<String, ContentPreview> generatePreviews(Post post, List<String> platforms) {
        Map<String, ContentPreview> previews = new HashMap<>();
        
        for (String platform : platforms) {
            ContentPreview preview = generatePlatformPreview(post, platform);
            previews.put(platform, preview);
        }
        
        return previews;
    }
    
    private ContentPreview generatePlatformPreview(Post post, String platform) {
        PlatformAdapter adapter = platformAdapterRegistry.getAdapter(platform);
        
        ContentPreview preview = new ContentPreview();
        preview.setPlatform(platform);
        preview.setContent(adapter.adaptContent(post.getContent()));
        preview.setCharacterCount(preview.getContent().length());
        preview.setCharacterLimit(adapter.getCharacterLimit());
        preview.setMediaFiles(adapter.adaptMediaFiles(post.getMediaFiles()));
        preview.setHashtags(adapter.adaptHashtags(post.getHashtags()));
        preview.setWarnings(adapter.validateContent(post));
        
        return preview;
    }
}
```

### Mobile Content Creation Service (React Native)
```typescript
import { launchCamera, launchImageLibrary, MediaType } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class MobileContentService {
  private static readonly DRAFT_KEY = 'content_drafts';

  async requestCameraPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'SocialSync needs access to your camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  async capturePhoto(): Promise<string | null> {
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    return new Promise((resolve, reject) => {
      launchCamera(
        {
          mediaType: 'photo' as MediaType,
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: 1920,
        },
        (response) => {
          if (response.didCancel || response.errorMessage) {
            resolve(null);
          } else if (response.assets && response.assets[0]) {
            resolve(response.assets[0].uri || null);
          } else {
            reject(new Error('Failed to capture photo'));
          }
        }
      );
    });
  }

  async selectFromGallery(mediaType: 'photo' | 'video' | 'mixed' = 'mixed'): Promise<string[]> {
    return new Promise((resolve, reject) => {
      launchImageLibrary(
        {
          mediaType: mediaType as MediaType,
          quality: 0.8,
          selectionLimit: 10,
        },
        (response) => {
          if (response.didCancel || response.errorMessage) {
            resolve([]);
          } else if (response.assets) {
            const uris = response.assets
              .map(asset => asset.uri)
              .filter(uri => uri !== undefined) as string[];
            resolve(uris);
          } else {
            reject(new Error('Failed to select media'));
          }
        }
      );
    });
  }

  async saveDraft(content: any): Promise<void> {
    try {
      const existingDrafts = await this.getDrafts();
      const newDraft = {
        id: Date.now().toString(),
        ...content,
        createdAt: new Date().toISOString(),
      };

      const updatedDrafts = [...existingDrafts, newDraft];
      await AsyncStorage.setItem(this.DRAFT_KEY, JSON.stringify(updatedDrafts));
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw error;
    }
  }

  async getDrafts(): Promise<any[]> {
    try {
      const draftsJson = await AsyncStorage.getItem(this.DRAFT_KEY);
      return draftsJson ? JSON.parse(draftsJson) : [];
    } catch (error) {
      console.error('Failed to get drafts:', error);
      return [];
    }
  }

  async deleteDraft(draftId: string): Promise<void> {
    try {
      const existingDrafts = await this.getDrafts();
      const updatedDrafts = existingDrafts.filter(draft => draft.id !== draftId);
      await AsyncStorage.setItem(this.DRAFT_KEY, JSON.stringify(updatedDrafts));
    } catch (error) {
      console.error('Failed to delete draft:', error);
      throw error;
    }
  }

  async syncDrafts(): Promise<void> {
    try {
      const drafts = await this.getDrafts();
      const unsynced = drafts.filter(draft => !draft.synced);

      for (const draft of unsynced) {
        try {
          // Upload draft to server
          await this.uploadDraft(draft);
          draft.synced = true;
        } catch (error) {
          console.error('Failed to sync draft:', draft.id, error);
        }
      }

      await AsyncStorage.setItem(this.DRAFT_KEY, JSON.stringify(drafts));
    } catch (error) {
      console.error('Failed to sync drafts:', error);
    }
  }

  private async uploadDraft(draft: any): Promise<void> {
    // Implementation for uploading draft to server
    const response = await fetch('/api/v1/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`,
      },
      body: JSON.stringify(draft),
    });

    if (!response.ok) {
      throw new Error('Failed to upload draft');
    }
  }

  private async getAuthToken(): Promise<string> {
    // Get auth token from secure storage
    return AsyncStorage.getItem('auth_token') || '';
  }
}

export default new MobileContentService();
```

## 6. Testing Requirements
- **Unit Tests:** Content validation, media processing, template management
- **Integration Tests:** File upload, content CRUD operations, platform adapters
- **Mobile Tests:** Camera integration, gallery access, offline functionality
- **Performance Tests:** Large file uploads, bulk operations, concurrent access
- **Security Tests:** File upload security, content sanitization, mobile permissions
- **User Acceptance Tests:** Complete content creation workflows on web and mobile
- **Device Tests:** Camera functionality across different mobile devices

## 7. Acceptance Criteria (Definition of Done)
- [ ] Web content creation and editing functionality working
- [ ] Mobile content creation with camera integration working
- [ ] Media upload and processing pipeline operational on both platforms
- [ ] Content library with organization and search working
- [ ] Template system implemented and tested
- [ ] Platform-specific content validation working
- [ ] Content preview system showing accurate representations
- [ ] Bulk operations for content and media management
- [ ] Content versioning and history tracking
- [ ] Integration with scheduling system working
- [ ] Performance optimized for large content libraries
- [ ] Mobile offline functionality with draft sync working
- [ ] Native camera and gallery integration working
- [ ] Mobile permissions handling implemented
- [ ] Cross-platform content synchronization working

## 8. Best Practices Reminders
- **Security:** Validate and sanitize all user content and uploaded files
- **Performance:** Optimize media processing and use background jobs for heavy operations
- **User Experience:** Provide real-time feedback and validation during content creation
- **Platform Compliance:** Ensure all content meets platform-specific requirements
- **Storage Efficiency:** Implement proper media lifecycle management and cleanup
- **Backup:** Ensure content and media are properly backed up and recoverable
- **Accessibility:** Support accessibility features in content creation tools
