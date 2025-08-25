# Signup API with Religion Selection - Documentation

## Overview
The updated Signup API now includes religion selection, allowing users to choose their religious affiliation during registration. This feature helps personalize content and connect users with similar beliefs.

## Endpoint
```
POST /api/auth/signup
```

## Request Body

### Required Fields
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "religion": "hinduism"
}
```

### Optional Fields
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "religion": "hinduism",
  "username": "johndoe" // Auto-generated if not provided
}
```

## Religion Options

### Available Religions
The API supports the following religion options:

| Religion ID | Religion Name | Description |
|-------------|---------------|-------------|
| `hinduism` | Hinduism | One of the world's oldest religions, originating in the Indian subcontinent |
| `islam` | Islam | A monotheistic Abrahamic religion based on the teachings of Prophet Muhammad |
| `christianity` | Christianity | A monotheistic religion based on the life and teachings of Jesus Christ |
| `buddhism` | Buddhism | A spiritual tradition focused on personal spiritual development and enlightenment |
| `sikhism` | Sikhism | A monotheistic religion founded in the Punjab region of South Asia |
| `judaism` | Judaism | One of the oldest monotheistic religions, the religion of the Jewish people |
| `jainism` | Jainism | An ancient Indian religion that emphasizes non-violence and spiritual purity |
| `zoroastrianism` | Zoroastrianism | One of the world's oldest monotheistic religions, founded in ancient Persia |
| `bahai` | Bahá'í Faith | A monotheistic religion emphasizing the spiritual unity of all humankind |
| `shinto` | Shinto | The indigenous religion of Japan, focusing on ritual practices and reverence for kami |
| `taoism` | Taoism | A philosophical and religious tradition emphasizing living in harmony with the Tao |
| `confucianism` | Confucianism | A system of philosophical and ethical teachings founded by Confucius |
| `other` | Other | Other religious or spiritual beliefs not listed above |
| `none` | No Religion / Atheist | No religious affiliation or atheistic beliefs |

## Response Format

### Success Response (201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "68abecf0a28e1fa778af9845",
      "email": "user@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "religion": "hinduism",
      "avatar": "",
      "bio": "",
      "website": "",
      "location": "",
      "isPrivate": false,
      "isEmailVerified": false,
      "followersCount": 0,
      "followingCount": 0,
      "postsCount": 0,
      "reelsCount": 0,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Required Fields
```json
{
  "success": false,
  "message": "Email, password, and full name are required"
}
```

#### 400 Bad Request - Religion Required
```json
{
  "success": false,
  "message": "Religion selection is required"
}
```

#### 400 Bad Request - Invalid Religion
```json
{
  "success": false,
  "message": "Invalid religion. Please choose from: hinduism, islam, christianity, buddhism, sikhism, judaism, jainism, zoroastrianism, bahai, shinto, taoism, confucianism, other, none"
}
```

#### 400 Bad Request - Email Already Registered
```json
{
  "success": false,
  "message": "Email already registered"
}
```

#### 400 Bad Request - Username Already Taken
```json
{
  "success": false,
  "message": "Username already taken"
}
```

#### 400 Bad Request - Invalid Email
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```

#### 400 Bad Request - Weak Password
```json
{
  "success": false,
  "message": "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
}
```

#### 405 Method Not Allowed
```json
{
  "success": false,
  "message": "Method not allowed"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details (development only)"
}
```

## Usage Examples

### cURL Examples

#### Basic Signup with Religion
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "fullName": "John Doe",
    "religion": "hinduism"
  }'
```

#### Signup with Custom Username
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "MyPassword456!",
    "fullName": "Jane Smith",
    "username": "janesmith",
    "religion": "christianity"
  }'
```

### JavaScript/Node.js Examples

#### Basic Signup
```javascript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    fullName: 'User Name',
    religion: 'buddhism'
  })
});

const data = await response.json();
if (data.success) {
  console.log('User registered:', data.data.user);
  console.log('Token:', data.data.token);
} else {
  console.error('Registration failed:', data.message);
}
```

#### Signup with Error Handling
```javascript
const signupUser = async (userData) => {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (data.success) {
      // Store token and user data
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user_data', JSON.stringify(data.data.user));
      
      return {
        success: true,
        user: data.data.user,
        token: data.data.token
      };
    } else {
      return {
        success: false,
        message: data.message
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error occurred'
    };
  }
};

// Usage
const result = await signupUser({
  email: 'test@example.com',
  password: 'TestPass123!',
  fullName: 'Test User',
  religion: 'islam'
});

if (result.success) {
  console.log('Registration successful!');
} else {
  console.error('Registration failed:', result.message);
}
```

### React/Next.js Examples

#### Signup Form Component
```typescript
import { useState } from 'react';

interface SignupFormData {
  email: string;
  password: string;
  fullName: string;
  religion: string;
  username?: string;
}

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    fullName: '',
    religion: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Handle successful registration
        localStorage.setItem('auth_token', data.data.token);
        // Redirect or update state
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password *
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium">
          Full Name *
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="religion" className="block text-sm font-medium">
          Religion *
        </label>
        <select
          id="religion"
          name="religion"
          value={formData.religion}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Select Religion</option>
          <option value="hinduism">Hinduism</option>
          <option value="islam">Islam</option>
          <option value="christianity">Christianity</option>
          <option value="buddhism">Buddhism</option>
          <option value="sikhism">Sikhism</option>
          <option value="judaism">Judaism</option>
          <option value="jainism">Jainism</option>
          <option value="zoroastrianism">Zoroastrianism</option>
          <option value="bahai">Bahá'í Faith</option>
          <option value="shinto">Shinto</option>
          <option value="taoism">Taoism</option>
          <option value="confucianism">Confucianism</option>
          <option value="other">Other</option>
          <option value="none">No Religion / Atheist</option>
        </select>
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium">
          Username (Optional)
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <p className="mt-1 text-sm text-gray-500">
          Leave blank to auto-generate from your name
        </p>
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-600 text-sm">
          Registration successful! Please check your email.
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default SignupForm;
```

## Religion Information API

### Get Available Religions
```
GET /api/religions
```

#### Query Parameters
- `format`: Response format (`simple`, `categories`, or `full` - default)
- `search`: Search religions by name, description, or categories

#### Examples

**Simple Format (for dropdowns):**
```bash
curl "http://localhost:3000/api/religions?format=simple"
```

**Categories Format:**
```bash
curl "http://localhost:3000/api/religions?format=categories"
```

**Search Religions:**
```bash
curl "http://localhost:3000/api/religions?search=hindu"
```

**Full Format with Search:**
```bash
curl "http://localhost:3000/api/religions?search=meditation&format=full"
```

## Validation Rules

### Email
- Required
- Must be valid email format
- Must be unique (not already registered)

### Password
- Required
- Minimum 8 characters
- Must contain uppercase, lowercase, number, and special character

### Full Name
- Required
- Minimum 2 characters
- Maximum 50 characters

### Religion
- Required
- Must be one of the predefined religion IDs
- Case-insensitive (stored in lowercase)

### Username
- Optional
- Auto-generated from full name if not provided
- Must be unique if provided
- Minimum 3 characters
- Maximum 30 characters
- Only letters, numbers, and underscores allowed

## Database Schema Updates

### User Model
The User model now includes:
```typescript
religion: {
  type: String,
  required: true,
  enum: ['hinduism', 'islam', 'christianity', 'buddhism', 'sikhism', 'judaism', 'jainism', 'zoroastrianism', 'bahai', 'shinto', 'taoism', 'confucianism', 'other', 'none'],
  lowercase: true
}
```

## Security Features

### Password Security
- Passwords are hashed using bcrypt
- Minimum strength requirements enforced
- Secure password validation

### Input Validation
- All inputs are validated and sanitized
- Religion selection is restricted to predefined options
- Email format validation
- Username uniqueness validation

### Rate Limiting
- Consider implementing rate limiting for production use
- Monitor signup patterns for suspicious activity

## Testing

### Test Scenarios
1. **Valid Signup**: All required fields with valid religion
2. **Missing Religion**: Signup without religion selection
3. **Invalid Religion**: Signup with non-existent religion
4. **Duplicate Email**: Signup with existing email
5. **Weak Password**: Signup with weak password
6. **Invalid Email**: Signup with malformed email
7. **Custom Username**: Signup with custom username
8. **Auto Username**: Signup without username

### Test Commands
```bash
# Test valid signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","fullName":"Test User","religion":"hinduism"}'

# Test religions API
curl "http://localhost:3000/api/religions?format=simple"
```

## Future Enhancements

### Potential Improvements
1. **Religion Preferences**: Allow multiple religion selections
2. **Custom Religions**: Allow users to specify custom religions
3. **Religion Verification**: Optional verification of religious affiliation
4. **Content Personalization**: Religion-based content recommendations
5. **Community Features**: Religion-based user communities
6. **Analytics**: Religion-based user analytics and insights

## Support

For questions or issues with the Signup API with Religion Selection, please refer to:
- API documentation
- Religion options list
- Validation rules
- Error messages
- Development team
