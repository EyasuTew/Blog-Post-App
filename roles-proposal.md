# Proposal For database change

## Question 1
I will add a Role column to on user_post table so each user_post relationship would have a corresponding Role. 
To confirm that at least one of the entries in the connection was an Owner. Then Role will has assosicated permissions , permissions for example user with Owner Role of the post will has permissions like Write, Read, Delete, Update. So Role will have many to many relationship with Permission table. Based on the role and assoicated permission to the role in specific post we can limit the operation different user can perform on specific post. This table would make it easier to add new roles and permissions as needed, without necessitating the modification code. The database schema design will be available below question 2.


## Question 2
Instead of only validating that the user was associated with the post when the user submits a request, it would also validate that the user has the necessary Update permission in it's Role relationship with the post for the requested. The user must has a role with the Update permission to update tags or text attributes of the post. 
Also there are some operation which only done by Owner of the post. Owner of the post will has Owner role with all read, write, update and delete permission, so user with Owner role can add, and remove Users(authors) from post. Also only owner role can update user's(authors of post) add and remove Users permission associated with their role on speicific post.

![Image for database design schema](databasedesign.png?raw=true "Title")
