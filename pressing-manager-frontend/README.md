# Pressing Manager Application

## Overview
The Pressing Manager application is designed to help manage clothing items across multiple stores. It allows users to track the status of items, manage stores, and handle user roles effectively.

## Features
- **Store Management**: Each store has its own list of items, allowing for organized management.
- **User Roles**: The application supports different user roles, including Admin and Manager.
  - **Admin**: Can invite Managers via email and manage store settings.
  - **Manager**: Can manage items within their assigned store but cannot modify store settings.
- **Item Tracking**: Users can view the status of items, including deadlines and pending items.
- **Statistics**: Admins can view statistics related to items and stores.

## File Structure
The project is structured as follows:

```
pressing-manager-frontend
├── src
│   ├── main.ts
│   ├── App.vue
│   ├── firebase.ts
│   ├── router
│   │   └── index.ts
│   ├── components
│   │   ├── layout
│   │   │   ├── AppHeader.vue
│   │   │   └── AppFooter.vue
│   │   ├── common
│   │   │   ├── LoadingWrapper.vue
│   │   │   └── QuickActionCard.vue
│   │   ├── items
│   │   │   ├── ItemList.vue
│   │   │   ├── ItemDetailCard.vue
│   │   │   ├── ItemRegistrationForm.vue
│   │   │   └── DeadlinesList.vue
│   │   └── stores
│   │       ├── StoreList.vue
│   │       ├── StoreCard.vue
│   │       ├── StoreDetail.vue
│   │       ├── StoreSettings.vue
│   │       ├── ManageUsers.vue
│   │       └── InviteManagerForm.vue
│   ├── composables
│   │   ├── useFormatting.ts
│   │   └── useStores.ts
│   ├── store
│   │   ├── auth.ts
│   │   ├── items.ts
│   │   ├── stores.ts
│   │   ├── invites.ts
│   │   ├── itemsStore.ts
│   │   └── types.ts
│   ├── services
│   │   ├── storesService.ts
│   │   └── invitesService.ts
│   └── views
│       ├── Home.vue
│       ├── Stores.vue
│       ├── Store.vue
│       ├── Item.vue
│       ├── ItemRegister.vue
│       ├── Login.vue
│       ├── Register.vue
│       ├── Deadlines.vue
│       ├── Pending.vue
│       ├── Stats.vue
│       └── Types.vue
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting Started
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set up Firebase configuration in `src/firebase.ts`.
4. Run the application using `npm run dev`.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.