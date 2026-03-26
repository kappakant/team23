import csv
import os

class EmployeeDatabase:
    def __init__(self, db_name="employee_records_DB.csv"):
        """Initialize the CSV file connection and create the file with headers if it doesn't exist."""
        self.db_name = db_name
        self.fieldnames = ['id', 'first_name', 'last_name', 'birthdate', 'hire_date', 'job_title']
        self._create_file()
        
    def __del__(self):
        self.close_connection()
    
    def _create_file(self):
        """Create the CSV file with headers if it doesn't already exist."""
        if not os.path.exists(self.db_name):
            with open(self.db_name, 'w', newline='') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=self.fieldnames)
                writer.writeheader()
    
    def _get_next_id(self):
        """Get the next available ID by reading all existing IDs."""
        if not os.path.exists(self.db_name) or os.path.getsize(self.db_name) == 0:
            return 1
        
        with open(self.db_name, 'r', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            ids = [int(row['id']) for row in reader if row['id']]
            return max(ids) + 1 if ids else 1
    
    def insert_employee(self, first_name, last_name, birthdate, hire_date, job_title):
        """Insert a new employee into the CSV file."""
        next_id = self._get_next_id()
        
        with open(self.db_name, 'a', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=self.fieldnames)
            writer.writerow({
                'id': next_id,
                'first_name': first_name,
                'last_name': last_name,
                'birthdate': birthdate,
                'hire_date': hire_date,
                'job_title': job_title
            })
    
    def get_employee(self, first_name, last_name):
        """Fetch an employee by first and last name."""
        with open(self.db_name, 'r', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['first_name'] == first_name and row['last_name'] == last_name:
                    return f"ID: {row['id']}, Name: {row['first_name']} {row['last_name']}, Birthdate: {row['birthdate']}, Hire Date: {row['hire_date']}, Job Title: {row['job_title']}"
        return None
    
    def get_all_employees(self):
        """Retrieve all employee records."""
        employees = []
        
        if not os.path.exists(self.db_name):
            return employees
        
        with open(self.db_name, 'r', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # Convert to tuple format matching SQL output
                employees.append((
                    int(row['id']),
                    row['first_name'],
                    row['last_name'],
                    row['birthdate'],
                    row['hire_date'],
                    row['job_title']
                ))
        
        return employees
    
    def close_connection(self):
        """Close the connection (no-op for CSV, but maintains interface compatibility)."""
        pass
