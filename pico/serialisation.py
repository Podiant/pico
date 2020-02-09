class Registry(object):
    def __init__(self):
        self.__dict = {}

    def register(self, name, model, func):
        self.__dict[name] = (model, func)

    def get(self, name):
        return self.__dict[name]


class serialiser(object):
    def __init__(self, name, model):
        self.name = name
        self.model = model

    def __call__(self, func):
        registry.register(self.name, self.model, func)
        return func


class SerialisationError(Exception):
    pass


def include(type, id):
    try:
        Model, func = registry.get(type)
    except KeyError:  # pragma: no cover
        raise SerialisationError(
            'Serialiser not found for type \'%s\'.' % type
        )

    obj = Model.objects.get(pk=id)
    ret = {
        'type': type
    }

    ret.update(func(obj))
    return ret


registry = Registry()
