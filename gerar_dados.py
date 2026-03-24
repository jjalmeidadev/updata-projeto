import csv
import random
from faker import Faker

# Inicializa o gerador de dados falsos
fake = Faker()

# Define as colunas exatamente como na sua planilha
headers = ['id', 'first_name', 'last_name', 'email', 'gender', 'ip_address', 'company', 'department', 'job_title']

genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
departments = ['Engineering', 'Sales', 'HR', 'Marketing', 'Finance', 'Operations']

print("Gerando 50.000 linhas de dados. Por favor, aguarde...")

# Cria e escreve no arquivo CSV
with open('dataset_50k.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(headers) # Escreve o cabeçalho
    
    # Gera as 50.000 linhas
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

print("Arquivo 'dataset_50k.csv' gerado com sucesso!")