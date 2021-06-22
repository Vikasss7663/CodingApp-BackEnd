#include<stdio.h>
int main() {
    char name[50];
    gets(name);
    int age;
    scanf("%d",&age);
    printf("Hello, My name is %s and my age is %d.\n",name,age);
}