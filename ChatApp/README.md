# Project Name

## Description

This project is a web application built with Python that leverages Boto3's Bedrock API for backend operations and Streamlit for the frontend interface. The application provides a possibility to book a hotel room based on chosen preferences, using Gen Ai recommendations.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [License](#license)

## Installation

### Prerequisites

- Python 3.x
- pip (Python package installer)
- pipenv (Python dependency manager)
- AWS account with necessary permissions to use Bedrock API

### Steps

1. Clone the repository:

    ```sh
    git clone https://github.com/krykhtina/gen-ai-simplified-w-bedrock.git
    cd gen-ai-simplified-w-bedrock/ChatApp
    ```

2. Install pipenv if you haven't already:

    ```sh
    pip install pipenv
    ```

3. Create a virtual environment and install dependencies:

    ```sh
    pipenv install
    ```

4. Activate the virtual environment:

    ```sh
    pipenv shell
    ```

## Configuration

1. **AWS Configuration:**

    Ensure that your AWS credentials are configured. You can set them up using the AWS CLI:

    ```sh
    aws configure
    ```

    Alternatively, you can set the environment variables:

    ```sh
    export AWS_ACCESS_KEY_ID=your_access_key_id
    export AWS_SECRET_ACCESS_KEY=your_secret_access_key
    export AWS_DEFAULT_REGION=your_region
    ```

2. **Application Configuration:**

    Create a configuration file `.streamlit/secrets.toml` in the root directory of your project with the necessary settings:

    ```toml
    region="your_region"
    bedrock_agent_id="your_bedrock_agent_id"
    bedrock_agent_alias_id="bedrock_agent_alias_id"
    ```

## Usage

1. Run the Streamlit application in the root folder (`ChatApp`):

    ```sh
    streamlit run src/app.py
    ```

2. Open your web browser and navigate to `http://localhost:8501` to access the application.

3. Use the interface to interact with the Bedrock API.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any issues or questions, please open an issue in the repository or contact our team:

- alexa.krykhtina@gmail.com
- anadabrowska98@gmail.com
