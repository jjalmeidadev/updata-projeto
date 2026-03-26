import csv
import random
from faker import Faker

# Initialize the fake data generator
fake = Faker()

# Define the columns exactly as in your spreadsheet
headers = ['id', 'first_name', 'last_name', 'email', 'gender', 'ip_address', 'company', 'department', 'job_title']

genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
departments = ['Engineering', 'Sales', 'HR', 'Marketing', 'Finance', 'Operations']

print("Generating 50,000 rows of data. Please wait...")

# Create and write to the CSV file
with open('dataset_50k.csv', 'w', newline='', encoding='utf-8') as file:
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

print("File 'dataset_50k.csv' generated successfully!")