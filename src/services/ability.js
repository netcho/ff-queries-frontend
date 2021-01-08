import { AbilityBuilder, Ability } from '@casl/ability';

export function defineAbilitiesFor(user) {
    const { can, build } = new AbilityBuilder(Ability);

    switch (user.role) {
        case 'user': {
            can('create', 'Query');
            can('read', 'Query');
            can('update', 'Query');
            can('delete', 'Query');
            break;
        }
        case 'admin': {
            can('create', 'Query');
            can('read', 'Query');
            can('update', 'Query');
            can('delete', 'Query');
            can('manage', 'User');
            break;
        }
        case 'guest': {
            can('read', 'Query');
            break;
        }
    }

    return build();
}