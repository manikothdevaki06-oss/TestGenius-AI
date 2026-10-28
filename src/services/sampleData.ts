/**
 * Sample scenarios for instant testing and QA validation
 */

export interface SampleScenario {
  id: string;
  name: string;
  badge: string;
  description: string;
  stagingUrl: string;
  componentCode: string;
}

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: 'login-auth-form',
    name: 'SaaS User Login Form (Interactive Demo)',
    badge: 'Recommended',
    description:
      'Standard user authentication form with email and password inputs, "Remember me" checkbox, Show/Hide password toggle, OAuth Social buttons (Google/GitHub), CSRF token header, and "Forgot password" link. Includes client-side format checks and submits via POST /api/auth/login with JSON body.',
    stagingUrl: 'https://staging.app.example.com/login',
    componentCode: `<form id="loginForm" method="POST" action="/api/v1/auth/login" novalidate>
  <input type="hidden" name="csrf_token" value="d290f1eeec244b4899577a39379" />
  
  <div class="form-group mb-4">
    <label for="user-email" class="font-medium text-sm">Work Email Address</label>
    <input
      id="user-email"
      name="email"
      type="email"
      required
      autocomplete="username"
      placeholder="alex@company.com"
      pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
      class="border rounded px-3 py-2 w-full focus:ring-2"
    />
    <span id="email-error" class="hidden text-xs text-red-500" role="alert">Please enter a valid work email</span>
  </div>

  <div class="form-group mb-4">
    <div class="flex justify-between items-center mb-1">
      <label for="user-password" class="font-medium text-sm">Password</label>
      <a href="/forgot-password" class="text-xs text-indigo-600 hover:underline">Forgot password?</a>
    </div>
    <div class="relative">
      <input
        id="user-password"
        name="password"
        type="password"
        minlength="8"
        maxlength="64"
        required
        autocomplete="current-password"
        placeholder="••••••••"
        class="border rounded px-3 py-2 w-full pr-10 focus:ring-2"
      />
      <button
        type="button"
        id="toggle-password"
        aria-label="Toggle password visibility"
        class="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
      >
        <span class="sr-only">Show password</span>
        👁️
      </button>
    </div>
    <span id="password-error" class="hidden text-xs text-red-500" role="alert">Password must be at least 8 characters</span>
  </div>

  <div class="flex items-center justify-between mb-6">
    <label class="flex items-center text-sm cursor-pointer">
      <input type="checkbox" id="remember-me" name="remember" class="rounded text-indigo-600" />
      <span class="ml-2 text-gray-700">Remember this device for 30 days</span>
    </label>
  </div>

  <button
    id="btn-login-submit"
    type="submit"
    class="w-full bg-indigo-600 text-white font-medium py-2 rounded shadow hover:bg-indigo-700 disabled:opacity-50"
  >
    Sign in to Workspace
  </button>

  <div class="divider my-4 text-center text-xs text-gray-500">or continue with</div>
  <button type="button" id="btn-oauth-google" class="w-full border py-2 rounded text-sm mb-2 flex items-center justify-center">
    Sign in with Google
  </button>
</form>`,
  },
  {
    id: 'checkout-payment',
    name: 'E-Commerce Checkout & Payment Modal',
    badge: 'Payment Flow',
    description:
      'Checkout payment modal collecting Cardholder Name, 16-digit Card Number with Luhn validation, Expiration Date (MM/YY), 3-4 digit CVV, Promo coupon field, and Billing ZIP code. Submits tokenized payload to payment processor.',
    stagingUrl: 'https://staging.store.example.com/checkout/pay',
    componentCode: `<div id="payment-modal" role="dialog" aria-labelledby="pay-title" class="p-6 bg-white rounded-xl shadow-lg">
  <h2 id="pay-title" class="text-xl font-bold mb-4">Complete Payment</h2>
  
  <form id="checkout-form">
    <div class="mb-3">
      <label for="card-name" class="block text-sm font-medium">Cardholder Full Name</label>
      <input id="card-name" type="text" required maxlength="70" class="input-field" placeholder="Jane Doe" />
    </div>

    <div class="mb-3">
      <label for="card-number" class="block text-sm font-medium">Card Number</label>
      <input id="card-number" type="tel" inputmode="numeric" required maxlength="19" placeholder="4242 •••• •••• 4242" />
    </div>

    <div class="grid grid-cols-2 gap-3 mb-3">
      <div>
        <label for="card-expiry" class="block text-sm font-medium">Expires (MM/YY)</label>
        <input id="card-expiry" type="text" placeholder="12/28" maxlength="5" required />
      </div>
      <div>
        <label for="card-cvv" class="block text-sm font-medium">CVV / CVC</label>
        <input id="card-cvv" type="password" inputmode="numeric" maxlength="4" placeholder="123" required />
      </div>
    </div>

    <div class="mb-4">
      <label for="coupon-code" class="block text-sm font-medium">Discount Code (Optional)</label>
      <div class="flex gap-2">
        <input id="coupon-code" type="text" placeholder="SAVE20" uppercase />
        <button type="button" id="btn-apply-coupon" class="px-3 py-1 bg-gray-200 text-sm rounded">Apply</button>
      </div>
    </div>

    <div class="total-summary p-3 bg-gray-50 rounded mb-4">
      <div class="flex justify-between font-bold">
        <span>Total Due:</span>
        <span id="order-total-amount">$149.00 USD</span>
      </div>
    </div>

    <button id="btn-pay-now" type="submit" class="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded">
      Pay $149.00 Securely
    </button>
  </form>
</div>`,
  },
  {
    id: 'profile-avatar-upload',
    name: 'Profile Settings & Avatar Upload',
    badge: 'Media & A11y',
    description:
      'Account settings page allowing user to change display name, public bio (max 280 chars), email notification preferences, and upload an avatar file (JPG/PNG, max 5MB) with drag-and-drop zone.',
    stagingUrl: 'https://staging.app.example.com/settings/profile',
    componentCode: `<div class="settings-container max-w-xl">
  <h1 class="text-2xl font-bold mb-4">Profile Settings</h1>
  <form id="profile-form" enctype="multipart/form-data">
    <div class="avatar-section mb-6">
      <label class="block text-sm font-medium mb-2">Profile Avatar</label>
      <div id="drop-zone" class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer">
        <img id="avatar-preview" src="/static/default-avatar.png" alt="Current Avatar" class="w-20 h-20 rounded-full mx-auto mb-2" />
        <input type="file" id="avatar-input" name="avatar" accept="image/png, image/jpeg, image/webp" class="sr-only" />
        <p class="text-xs text-gray-500">PNG, JPG, or WEBP up to 5MB. Click or drag file here.</p>
      </div>
    </div>

    <div class="mb-4">
      <label for="display-name" class="block text-sm font-medium">Display Name</label>
      <input id="display-name" name="name" type="text" required minlength="2" maxlength="50" value="Alex Smith" class="w-full border p-2 rounded" />
    </div>

    <div class="mb-4">
      <div class="flex justify-between">
        <label for="bio-text" class="block text-sm font-medium">Biography</label>
        <span id="char-counter" class="text-xs text-gray-500">0/280</span>
      </div>
      <textarea id="bio-text" name="bio" rows="3" maxlength="280" class="w-full border p-2 rounded" placeholder="Tell the team about yourself..."></textarea>
    </div>

    <div class="mb-6">
      <label class="flex items-center">
        <input type="checkbox" id="public-profile-toggle" name="isPublic" checked />
        <span class="ml-2 text-sm font-medium">Make profile visible to public directories</span>
      </label>
    </div>

    <button id="btn-save-profile" type="submit" class="bg-blue-600 text-white px-5 py-2 rounded">
      Save Changes
    </button>
  </form>
</div>`,
  },
];
