# Storybook
![image](https://github.com/10234567Z/storybook/assets/93607971/17f8f9b5-e36b-4813-8a82-0ff09f62138e)
You can access it [here](https://storybook-iota-rust.vercel.app/)  

## Content
* [Features](https://github.com/10234567Z/storybook?tab=readme-ov-file#features)
* [Stack Used](https://github.com/10234567Z/storybook?tab=readme-ov-file#stack-used)
* [Installation](https://github.com/10234567Z/storybook?tab=readme-ov-file#installation)
  * [Pre-requisites](https://github.com/10234567Z/storybook?tab=readme-ov-file#pre-requisites)
  * [How to install](https://github.com/10234567Z/storybook?tab=readme-ov-file#how-to-install)
* [Contribute](https://github.com/10234567Z/storybook?tab=readme-ov-file#contribute)
* [License](https://github.com/10234567Z/storybook?tab=readme-ov-file#license)

## Features
* Create your own profile
* Follow the ones you like
* Interact worlwide through comments
* Give a gesture of like by liking
* Get realtime updates on likes and comments

## Stack Used
* React
* Typescript
* Next
* NodeJS
* PostgreSQL
* Supabase
* Tailwind  
  
  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRstFIb9c2xX_tz60TZ7bIMiCSYJiKIEgQLnDv9OXYFlw&s" alt="React" width="50px" height="50px">
  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEJD2kMz7mFOm1VnsNE36ceYbDgWp483t-pCih3rxa-w&s" alt="Typescript" width="50px" height="50px">
  <img src="https://www.drupal.org/files/styles/grid-3-2x/public/project-images/nextjs-icon-dark-background.png?itok=0YHs2vTR" alt="Next" width="50px" height="50px">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/120px-Node.js_logo.svg.png" alt="NodeJS" width="70px" height="50px">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Postgresql_elephant.svg/120px-Postgresql_elephant.svg.png" alt="PostgreSQL" width="50px" height="50px">
  <img src="https://yt3.googleusercontent.com/NuBWxGpdF0YzNSr7x_Tc8EEFXbQoHc0Xf9rU_ehxFPRikw8YPN886HltWeMDihKU8v5SeKFI3B4=s900-c-k-c0x00ffffff-no-rj" alt="Supabase" width="50px" height="50px">
  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQMAgy_XeSr2CmOITAysaZtDxsVUSTSYtSM2EKE5ivhg&s" alt="Tailwind" width="50px" height="50px">
  
## Installation
### Pre-requisites: 
- Have git installed and have your github account connected to your local system
- Live server extension on your local editor
- Have a supabase account and project with an authenticated user initialized
### How to install
* Open your **command line interface/Terminal** and navigate to the directory you want to install the repository.  
* Type the following commands -:  
  ```
  git clone git@github.com:10234567Z/storybook.git
  cd storybook
  npm install
  ```  
* Make a new file ``` .env.local ``` in base directory and copy the following code to that  
  ```
  NEXT_PUBLIC_GUEST_PASSWORD=<Type your autheticated user's email from supabase>
  NEXT_PUBLIC_GUEST_EMAIL=<Type your above email user's password>
  NEXT_PUBLIC_SUPABASE_URL=<Your supabase URL>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<Your supabase project's Anon Key>
  ```  
* Now type the command ``` npm run dev ``` in your terminal  
* Type ``` http://localhost:3000 ``` in your local browser to run the website locally  
  **NOTE :** Make sure another app is not running on 3000 port to run the app

## Contribute
Fork the repository , have fun contributing in this project!
For more information on how to contribute , Check out this [link](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project)

## License  
This project is licensed under BSD license.

  
