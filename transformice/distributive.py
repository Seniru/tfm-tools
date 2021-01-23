class Distributor:

    def __init__(self, workers):
        self.workers = workers
        self.iter = iter(workers)
        self.active = workers[0]

    def switch(self):
        try:
            self.active = next(self.iter)
        except StopIteration:
            self.iter = iter(self.workers)
            self.active = self.workers[0]

    
    def __getattr__(self, name):
        return self.active.__getattribute__(name)
