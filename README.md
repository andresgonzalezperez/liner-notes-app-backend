# LINER NOTES

### Check the App
**[Deploy link](liner-notes-app.netlify.app)**

## Description

LINER NOTES is a full‑stack music discovery platform where users can explore artists and albums, write reviews, save favorites, and manage their personal music profile. Admins can manage the entire catalog through a dedicated panel.

## User Stories

- **404:** As a user I can see a 404 page if I try to reach a page that does not exist.
- **Signup:** As an anon I can sign up so I can create my profile and start interacting with the platform.
- **Login:** As a user I can log in so I can access my favorites, reviews, and profile.
- **Logout:** As a user I can log out so no one else can access my account.
- **Browse Artists:** As a user I can browse all artists to discover new music.
- **Browse Albums:** As a user I can browse all albums and see their details.
- **Search:** As a user I can search artists or albums by name.
- **Album Reviews:** As a user I can write reviews on albums.
- **Artist Reviews:** As a user I can write reviews on artists.
- **Favorites:** As a user I can add/remove artists and albums from my favorites.
- **Profile:** As a user I can edit my profile and upload a profile picture.
- **Admin Panel:** As an admin I can create, edit, and delete artists, albums, and users.

## Backlog

User profile:
- View other users’ profiles and their favorites

Media:
- Audio previews for albums
- Artist galleries

Social:
- Follow other users
- Comment threads on reviews

# Client

## Routes

- `/` — Homepage  
- `/auth/signup` — Signup form  
- `/auth/login` — Login form  
- `/artists` — Artists list  
- `/artists/:id` — Artist detail  
- `/albums` — Albums list  
- `/albums/:id` — Album detail  
- `/profile` — My profile  
- `/profile/edit` — Edit profile  
- `/admin/*` — Admin panel  
- `*` — 404 page  

## Pages

- Home Page (public)
- Signup Page (anon only)
- Login Page (anon only)
- Artists List Page (public)
- Artist Detail Page (public)
- Albums List Page (public)
- Album Detail Page (public)
- My Profile Page (user only)
- Edit Profile Page (user only)
- Admin Dashboard (admin only)
- 404 Page (public)

## Components

- **ArtistCard component**  
  - Input: artist  
  - Output: navigate to artist detail  

- **AlbumCard component**  
  - Input: album  
  - Output: navigate to album detail  

- **SearchBar component**  
  - Output: change(query: string)

- **ReviewList / ReviewItem**  
  - Input: reviews  

- **FavoriteButton**  
  - Input: itemId, type ("artist" | "album"), isFavorite  
  - Output: toggleFavorite  

## IO

- Upload profile picture (Cloudinary)
- Upload artist image (Cloudinary)
- Upload album cover (Cloudinary)

## Services

### Auth Service
- `auth.signup(data)`
- `auth.login(data)`
- `auth.verify()`
- `auth.logout()`
- `auth.getUser()`

### Artist Service
- `artist.list()`
- `artist.detail(id)`
- `artist.create(data)` (admin)
- `artist.update(id, data)` (admin)
- `artist.delete(id)` (admin)
- `artist.addReview(id, data)`
- `artist.deleteReview(id, reviewId)` (admin)

### Album Service
- `album.list()`
- `album.detail(id)`
- `album.create(data)` (admin)
- `album.update(id, data)` (admin)
- `album.delete(id)` (admin)
- `album.addReview(id, data)`
- `album.deleteReview(id, reviewId)` (admin)

### User Service
- `user.get(id)`
- `user.update(id, data)`
- `user.changePassword(id, data)`
- `user.uploadAvatar(id, file)`
- `user.addFavoriteAlbum(id, albumId)`
- `user.removeFavoriteAlbum(id, albumId)`
- `user.addFavoriteArtist(id, artistId)`
- `user.removeFavoriteArtist(id, artistId)`

### Search Service
- `search.query(q)`

# Server

## Models

### User model

```
username: String (required)
email: String (required, unique)
password: String (required)
avatar: String
favoriteAlbums: [ObjectID<Album>]
favoriteArtists: [ObjectID<Artist>]
role: "user" | "admin"
```

### Artist model

```
name: String (required)
country: String
genre: String (required)
image: String
albums: [ObjectID<Album>]
reviews: [
  {
    user: ObjectID<User>
    comment: String
    rating: Number (1–5)
    date: Date
  }
]
```

### Album model

```
title: String (required)
artist: ObjectID<Artist> (required)
year: Number (required)
cover: String
genre: String (required)
tracklist: [String]
reviews: [
  {
    user: ObjectID<User>
    comment: String
    rating: Number (1–5)
    date: Date
  }
]
```

## API Endpoints/Backend Routes

### Auth
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/verify`

### Artists
- `GET /artists`
- `GET /artists/:id`
- `POST /artists` (admin)
- `PUT /artists/:id` (admin)
- `DELETE /artists/:id` (admin)
- `POST /artists/:id/reviews` (user)
- `DELETE /artists/:id/reviews/:reviewId` (admin)
- `POST /artists/:id/upload-image` (admin)

### Albums
- `GET /albums`
- `GET /albums/:id`
- `POST /albums` (admin)
- `PUT /albums/:id` (admin)
- `DELETE /albums/:id` (admin)
- `POST /albums/:id/reviews` (user)
- `DELETE /albums/:id/reviews/:reviewId` (admin)
- `POST /albums/:id/upload-cover` (admin)

### Users
- `GET /users` (admin)
- `GET /users/:id` (admin or owner)
- `PATCH /users/:id` (admin)
- `DELETE /users/:id` (admin)
- `PUT /users/:id/update` (owner)
- `PUT /users/:id/change-password` (owner)
- `POST /users/update-profile-picture/:id`
- `POST /users/:id/favorites/albums/:albumId`
- `DELETE /users/:id/favorites/albums/:albumId`
- `POST /users/:id/favorites/artists/:artistId`
- `DELETE /users/:id/favorites/artists/:artistId`

### Search
- `GET /search?q=term`

# Links

### GitHub
**[Client repository link](https://github.com/andresgonzalezperez/liner-notes-app-frontend.git)**
**[Server repository link](https://github.com/andresgonzalezperez/liner-notes-app-backend.git)** 

### Deploy
**[Frontend link](liner-notes-app.netlify.app)**
**[Backend link](https://liner-notes-app-backend.onrender.com)**

### Slides
**[Slides link]()**


