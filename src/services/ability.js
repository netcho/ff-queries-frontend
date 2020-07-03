import { AbilityBuilder, Ability } from '@casl/ability';

export function defineAbilitiesFor(user) {
    const { can, build } = new AbilityBuilder(Ability);

    switch (user.role) {
        case 'user':
        case 'admin': {
            can('create', 'Query');
            can('read', 'Query');
            can('update', 'Query');
            can('delete', 'Query');
            break;
        }
        case 'guest': {
            can('read', 'Query');
        }
    }

    return build();
}