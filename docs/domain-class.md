# Domain UML Class Diagram

## Table of Contents
1. [Overview](#1-overview)  
2. [Domain Class Diagram](#2-domain-class-diagram)  
3. [Domain Classes](#3-domain-classes)  
4. [Relationships and Multiplicities](#4-relationships-and-multiplicities)  
5. [Modeling Decisions](#5-modeling-decisions)  
6. [Conclusion](#6-conclusion)

---

# 1. Overview

This document presents the **Domain UML Class Diagram** for the project.

The objective of this artifact is to model the **conceptual classes** that exist in the problem domain, representing real-world entities and their relationships, rather than software implementation details.

This diagram:

- Identifies the main domain classes
- Defines their relevant attributes
- Establishes relationships with correct multiplicities
- Applies association, aggregation, and composition where appropriate

The model is purely conceptual and independent of programming language or database implementation.

---

# 2. Domain Class Diagram


<div align="center">
<sub>FIGURE X – [Insert Diagram Name Here]</sub><br>
  <img src="../assets/[filename].png" width="100%" alt="[Same as diagram name]">
  <sup>Source: Material produced by the authors, 2026.</sup>
</div>

The diagram must include:

- Domain classes
- Attributes (no data types required if purely conceptual)
- Multiplicities (e.g., 1, 0..1, 1..*, 0..*)
- Association types (association, aggregation, composition)
- Clear and consistent UML notation

---

# 3. Domain Classes

List and describe each conceptual class identified in the problem domain.

---

### Class 1: `<Class_Name>`

**Description:**  
Explain what real-world concept this class represents.

**Key Attributes:**

- attribute_1  
- attribute_2  
- attribute_3  

---

### Class 2: `<Class_Name>`

**Description:**  
Explain its role in the domain.

**Key Attributes:**

- attribute_1  
- attribute_2  

---

### Class 3: `<Class_Name>`

**Description:**  
Explain its purpose and importance in the model.

**Key Attributes:**

- attribute_1  
- attribute_2  

---

# 4. Relationships and Multiplicities

Describe the relationships between domain classes.

---

### Relationship 1: `<Class_A>` — `<Class_B>`

**Type:**  
- Association  
- Aggregation  
- Composition  

**Multiplicity:**

- `<Class_A>` → `<Class_B>`: (1 to 0)  
- `<Class_B>` → `<Class_A>`: (1 to 1)

**Description:**  
Explain what this relationship represents in the real world.

---

### Relationship 2: `<Class_X>` — `<Class_Y>`

**Type:**  
**Multiplicity:**  
**Description:**

---

# 5. Modeling Decisions

Provide a brief explanation of the key modeling decisions made when constructing the diagram.

Discuss:

- Why certain domain classes were included
- Why some concepts were excluded (if applicable)
- Why specific relationships were modeled as association, aggregation, or composition
- Justification for multiplicities
- The level of abstraction chosen
- Any assumptions made about the problem domain

This section should clearly demonstrate:

- Appropriate conceptual abstraction
- Correct use of UML notation
- Alignment with the real-world domain being modeled

---

# 6. Conclusion

The Domain UML Class Diagram:

- Models real-world entities relevant to the problem domain
- Uses proper UML notation
- Correctly represents relationships and multiplicities
- Maintains conceptual abstraction (no implementation details)
- Aligns with project requirements
