const mongoose = require('mongoose');

// Mock mongoose before requiring connectDB
jest.mock('mongoose', () => ({
    connect: jest.fn(),
    connection: {
        on: jest.fn()
    }
}));

const { connectDB } = require('../../config/database');

describe('Database Configuration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();
        console.error = jest.fn();
    });

    it('should connect to MongoDB successfully', async () => {
        mongoose.connect = jest.fn().mockResolvedValue(true);

        await connectDB();

        expect(mongoose.connect).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('MongoDB connected'));
    });

    it('should handle connection errors', async () => {
        const error = new Error('Connection failed');
        mongoose.connect = jest.fn().mockRejectedValue(error);
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

        await connectDB();

        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('MongoDB connection error'), error);
        expect(mockExit).toHaveBeenCalledWith(1);

        mockExit.mockRestore();
    });

    it('should use default MongoDB URI if not provided', async () => {
        delete process.env.MONGODB_URI;
        mongoose.connect = jest.fn().mockResolvedValue(true);

        await connectDB();

        expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/service-marketplace');
    });
});