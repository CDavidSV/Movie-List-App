![mml_logo_full](https://github.com/CDavidSV/Movie-List-App/assets/88672259/8c4f68ed-c3f7-4f74-abba-b387106de3b2)

An Interactive Movie app that allows you to create lists and keep track of the movies and TV shows you are watching or plan to watch. The platform offers a comprehensive solution to browse, organize, and track your favorite movies and TV series. With an intuitive interface and a wide range of features

Live Demo: https://www.mymovielist.cdavidsv.dev/
# Features
- **Browse Movies and Series**: Dive into an extensive library of movies and TV series, thanks to the TMDB API :).
- **Watchlist Management**: Easily add movies and series to your watchlist, track your progress, and update your completion status.
- **Favorites**: Curate a list of your all-time favorite movies and series, and rearrange them based on your preferences.
- **Customize your profile**: Change your username, add a profile picture or a banner.
- **Detailed Information**: Click on any movie or series to access detailed information, including cast, crew, images, videos, and more.
- **Search Functionality**: Quickly find movies or series.

# Images

![1](https://github.com/CDavidSV/Movie-List-App/assets/88672259/0ae02d58-4215-4274-9665-2a13e7c7b6e0)

![2](https://github.com/CDavidSV/Movie-List-App/assets/88672259/aeb303ed-debf-4f4e-88aa-866dbf0821db)

![3](https://github.com/CDavidSV/Movie-List-App/assets/88672259/5a66c224-6012-449d-a9f8-74b9dc27297a)

![4](https://github.com/CDavidSV/Movie-List-App/assets/88672259/213607b9-acf1-477d-a1b0-727f60288ce9)

![5](https://github.com/CDavidSV/Movie-List-App/assets/88672259/bcc52db7-c40d-4069-9eb2-d4ad73bfd679)

![6](https://github.com/CDavidSV/Movie-List-App/assets/88672259/cc73c844-7cbb-43d9-ab8c-ad4e5abd1980)

![7](https://github.com/CDavidSV/Movie-List-App/assets/88672259/56cfc03c-4fa4-4751-9790-bafe8ae5c1a4)

# Getting Started

To get a local copy up and running follow these simple steps.

## Prerequisites

- Ensure you have [Node.js](https://nodejs.org/) installed on your machine if you are running it without Docker.
- [Docker](https://www.docker.com/) is not required but can make setup easier.
- [MongoDB](https://www.mongodb.com/) is required, either locally or hosted on a cloud service.
- [AWS S3](https://aws.amazon.com/s3/) is required to store images.

## Setup Docker

You need to connect to your database and provide the API key and access token for the [TMDP API](https://developer.themoviedb.org/docs/getting-started)

These are the environment variables required for the backend:
- **MONGO_URI**: Url to connect to the MongoDB database. No need to worry about schemas or any additional data.
- **BUCKET_NAME**: Name of the AWS S3 bucket where images will be stored.
- **BUCKET_REGION**: Region of the AWS S3 bucket.
- **AWS_ACCESS_KEY_ID**: Access key for an AWS user.
- **AWS_SECRET_ACCESS_KEY**: Secret access key for an AWS user.
- **TMDB_API_KEY**: APIkey for TMDB API.
- **TMDB_ACCESS_TOKEN**: API access token for TMDB API.
- **ACCESS_TOKEN_KEY**: Cryptographically secure random string for generating access tokens (For user sessions).
- **REFRESH_TOKEN_KEY**: Cryptographically secure random string for generating refresh tokens.

All these variables have to be inside a .env file in the Backend directory. The build process will automatically copy this file to the Docker container.

For the frontend, you only need one env variable corresponding to the backend API base URL:
- **VITE_API_URL**: This has to bee inside a .env.development or .env.production file depending on the environment (e.g. VITE_API_URL="http://localhost:8080")

## Run

To run the app simply execute the following command on the console in the project directory: `docker-compose up --build`
