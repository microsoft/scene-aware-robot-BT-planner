# Prompt Structure for GPT Models

This folder contains a set of prompts used as input to GPT models. The prompts are designed to be processed in the following order:

## 1. `system.txt`
- **Purpose:**  
  Serves as the **system prompt** for the Vision-Language Model (VLM).  
  Sets the foundational context and behavior for the model.

## 2. `role_prompt.txt`
- **Purpose:**  
  Provides the VLM with **context for the task**.  
  Defines the role the model will take and the expectations for its performance.

## 3. `environment_prompt.txt`
- **Purpose:**  
  Describes the **structure of the input scene information**.  
  Includes specific details about the scene, such as the environment and map layout.  

## 4. `output_prompt.txt`
- **Purpose:**  
  Specifies the **expected output format**.  
  Clearly defines the structure and details of the desired responses from the VLM.

## 5. `action_prompt.txt`
- **Purpose:**  
  Defines the list of **robot actions** at the granularity of Behavior Trees (BTs).  
  Details the **arguments** required for each action.

## 6. `example_prompt.txt`
- **Purpose:**  
  Provides **examples** of the desired output format.  
  Acts as a reference to guide the model in generating appropriate responses.

## 7. `query.txt`
- **Purpose:**  
  Contains the **user's language instructions** and environment information.  
  Acts as the primary query to the VLM to initiate the task.
