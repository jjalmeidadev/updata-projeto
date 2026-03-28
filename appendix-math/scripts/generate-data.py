import csv
import random
from faker import Faker

# Initialize the fake data generator
fake = Faker()

# Define the columns exactly as in your spreadsheet
headers = ['id', 'first_name', 'last_name', 'email', 'gender', 'ip_address', 'company', 'department', 'job_title']

genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
departments = ['Engineering', 'Sales', 'HR', 'Marketing', 'Finance', 'Operations']

import os

print("Generating 50,000 rows of data. Please wait...")


# Define the output directory as appendix-math/csv relative to the script location
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
csv_dir = os.path.join(base_dir, 'csv')
os.makedirs(csv_dir, exist_ok=True)
output_path = os.path.join(csv_dir, 'onboarding_50001.csv')

# Create and write to the CSV file in the script's directory
with open(output_path, 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(headers)  # Write the header
    
    # Generate the 50,000 rows
    for i in range(1, 50001):
        writer.writerow([
            i,
            fake.first_name(),
            fake.last_name(),
            fake.email(),
            random.choice(genders),
            fake.ipv4(),
            fake.company(),
            random.choice(departments),
            fake.job()
        ])

print(f"File '{output_path}' generated successfully!")