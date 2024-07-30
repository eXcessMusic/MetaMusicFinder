# MetaMusicFinder

## Overview

MetaMusicFinder is an Angular-based web application that revolutionizes the way users discover and access music across various platforms. By leveraging the Spotify API for comprehensive music searches, this tool aggregates links to tracks across multiple music streaming services, providing a seamless experience for music enthusiasts to find their favorite songs on their preferred platforms.

## Key Features

- **Powerful Music Search**: Utilize Spotify's extensive database to search for tracks by keywords, artists, or song titles.
- **Multi-Platform Link Aggregation**: Instantly find where a track is available across various music streaming services.
- **Intuitive User Interface**: Clean, responsive design for effortless navigation and search result viewing.
- **Comprehensive Track Details**: Display rich information including track name, artist(s), album, release date, cover art, and ISRC.
- **Dynamic Results Loading**: Pagination with a "Show More" option for efficient browsing of search results.
- **Engaging User Experience**: Smooth animations enhance the visual appeal and responsiveness of the application.
- **Seamless Navigation**: Angular routing enables fluid movement between search results and detailed track views.

## Technologies Used

- Angular (latest version)
- TypeScript
- RxJS for reactive programming
- Angular Animations
- Spotify Web API
- Express.js backend for secure API handling
- Docker for easy deployment and scalability

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/eXcessMusic/MetaMusicFinder
   cd metamusicfinder
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Spotify API credentials to the `.env` file

4. Launch the application:
   ```
   npm start
   ```

5. Access MetaMusicFinder at `http://localhost:3000` in your web browser

## Development

For development mode with hot-reloading:
```
npm run start:dev
```

## Production Build

Create a production-ready build:
```
npm run build
```

## Docker Deployment

1. Build the Docker image:
   ```
   docker build -t metamusicfinder .
   ```

2. Run the Docker container:
   ```
   docker run -p 3000:3000 --env-file .env metamusicfinder
   ```

## Project Objectives

- Showcase advanced web application development using Angular and modern JavaScript practices.
- Demonstrate expertise in integrating and manipulating data from multiple third-party APIs.
- Implement robust front-end architecture with emphasis on performance and user experience.
- Provide a valuable tool for music discovery and cross-platform accessibility.
- Exhibit proficiency in asynchronous programming and efficient data management in web applications.

## Future Enhancements

- Expand music platform integrations for broader coverage.
- Introduce user accounts for personalized experiences and saved preferences.
- Develop detailed artist and album profile pages.
- Implement music preview capabilities where supported by platforms.
- Add advanced search and filtering options (e.g., by genre, release year, popularity).

## About the Developer

MetaMusicFinder is created by Thibault Paillon, demonstrating a fusion of technical expertise in web development, API integration, and intuitive UI/UX design. This project stands as a testament to the ability to conceptualize and execute complex, user-centric web applications that address real-world needs in the digital music landscape.

---

Crafted with ♥ by Thibault Paillon