const graphql = require('graphql');
const Student = require('../models/Student');
const Department = require('../models/Department');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema
} = graphql;

// ==================== TYPES ====================

// Department Type
const DepartmentType = new GraphQLObjectType({
  name: 'Department',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    code: { type: GraphQLString },
    hod: { type: GraphQLString },
    building: { type: GraphQLString },
    
    // Get all students in this department
    students: {
      type: new GraphQLList(StudentType),
      resolve(parent, args) {
        return Student.find({ department: parent.id });
      }
    }
  })
});

// Student Type
const StudentType = new GraphQLObjectType({
  name: 'Student',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    rollNumber: { type: GraphQLString },
    age: { type: GraphQLInt },
    phone: { type: GraphQLString },
    
    // Get department details
    department: {
      type: DepartmentType,
      resolve(parent, args) {
        return Department.findById(parent.department);
      }
    }
  })
});

// ==================== ROOT QUERY ====================

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    
    // Get single student by ID
    student: {
      type: StudentType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Student.findById(args.id);
      }
    },
    
    // Get all students
    students: {
      type: new GraphQLList(StudentType),
      resolve(parent, args) {
        return Student.find({});
      }
    },
    
    // Get single department by ID
    department: {
      type: DepartmentType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Department.findById(args.id);
      }
    },
    
    // Get all departments
    departments: {
      type: new GraphQLList(DepartmentType),
      resolve(parent, args) {
        return Department.find({});
      }
    },
    
    // Search students by name
    searchStudents: {
      type: new GraphQLList(StudentType),
      args: { name: { type: GraphQLString } },
      resolve(parent, args) {
        return Student.find({ 
          name: { $regex: args.name, $options: 'i' } 
        });
      }
    },
    
    // Get students by department
    studentsByDepartment: {
      type: new GraphQLList(StudentType),
      args: { departmentId: { type: GraphQLID } },
      resolve(parent, args) {
        return Student.find({ department: args.departmentId });
      }
    }
  }
});

// ==================== MUTATIONS ====================

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    
    // Create Department
    addDepartment: {
      type: DepartmentType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        code: { type: new GraphQLNonNull(GraphQLString) },
        hod: { type: new GraphQLNonNull(GraphQLString) },
        building: { type: GraphQLString }
      },
      async resolve(parent, args) {
        const department = new Department({
          name: args.name,
          code: args.code,
          hod: args.hod,
          building: args.building
        });
        return await department.save();
      }
    },
    
    // Create Student
    addStudent: {
      type: StudentType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        rollNumber: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLInt },
        phone: { type: GraphQLString },
        departmentId: { type: new GraphQLNonNull(GraphQLID) }
      },
      async resolve(parent, args) {
        const student = new Student({
          name: args.name,
          email: args.email,
          rollNumber: args.rollNumber,
          age: args.age,
          phone: args.phone,
          department: args.departmentId
        });
        return await student.save();
      }
    },
    
    // Update Student
    updateStudent: {
      type: StudentType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        age: { type: GraphQLInt },
        phone: { type: GraphQLString }
      },
      async resolve(parent, args) {
        return await Student.findByIdAndUpdate(
          args.id,
          { $set: args },
          { new: true } // Return updated document
        );
      }
    },
    
    // Update Department
    updateDepartment: {
      type: DepartmentType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        hod: { type: GraphQLString },
        building: { type: GraphQLString }
      },
      async resolve(parent, args) {
        return await Department.findByIdAndUpdate(
          args.id,
          { $set: args },
          { new: true }
        );
      }
    },
    
    // Delete Student
    deleteStudent: {
      type: StudentType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(parent, args) {
        return await Student.findByIdAndDelete(args.id);
      }
    },
    
    // Delete Department
    deleteDepartment: {
      type: DepartmentType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(parent, args) {
        // First check if any students exist in this department
        const studentsCount = await Student.countDocuments({ 
          department: args.id 
        });
        
        if (studentsCount > 0) {
          throw new Error('Cannot delete department with students');
        }
        
        return await Department.findByIdAndDelete(args.id);
      }
    }
  }
});

// ==================== EXPORT SCHEMA ====================

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});