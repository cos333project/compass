import pandas as pd
import numpy as np

# sems_attended is int
# class_taken_list is list of int lists (each element in the list represents a semester)
# curr_class_queue is an int list of courses student is planning to take
# major is type string (length 3 string representing the major)
class Student:
    def __init__(self, sems_attended, class_taken_list, curr_class_queue, major):
        assert(len(class_taken_list) == sems_attended)
        self.sems_attended = sems_attended
        self.class_taken_list = class_taken_list
        self.curr_class_queue = curr_class_queue
        self.major = major

    def add_to_queue(self, new_class):
        self.curr_class_queue.append(new_class)

    def rem_from_queue(self, to_be_deleted):
        assert(to_be_deleted in self.curr_class_queue)
        self.curr_class_queue.remove(to_be_deleted)

    # returns classes in taken in list format
    def get_classes_taken_list(self):
        li = []
        for element in self.class_taken_list:
            li = li + element
        return li
    
    def get_curr_class_queue(self):
        return self.curr_class_queue
    
    def get_major(self):
        return self.major
        
    
    